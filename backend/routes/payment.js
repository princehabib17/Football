const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Game = require('../models/Game');
const logger = require('../config/logger');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for Philippines (supports PHP, GCash, GrabPay, etc.)
router.post('/create-payment-intent',
  [
    body('gameId').isMongoId().withMessage('Invalid game ID'),
    body('numberOfPlayers').isInt({ min: 1 }).withMessage('Number of players must be at least 1'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('customerPhone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('isGuest').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { gameId, numberOfPlayers, customerEmail, customerName, customerPhone, isGuest, userId } = req.body;

      // Find the game
      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Check if game is available
      if (game.status !== 'open') {
        return res.status(400).json({ error: 'Game is not available for booking' });
      }

      // Check if enough spots available
      if (game.currentPlayers + numberOfPlayers > game.maxPlayers) {
        return res.status(400).json({ error: 'Not enough spots available' });
      }

      // Calculate total amount in centavos (PHP uses centavos like cents)
      const totalAmount = game.pricePerPlayer * numberOfPlayers;
      const amountInCentavos = Math.round(totalAmount * 100);

      // Create booking first
      const booking = new Booking({
        game: gameId,
        user: userId || null,
        guestInfo: isGuest ? {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        } : null,
        numberOfPlayers,
        totalAmount,
        currency: 'PHP',
        status: 'pending',
        isGuestBooking: isGuest || false
      });

      await booking.save();

      // Create Stripe payment intent with Philippines payment methods
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCentavos,
        currency: 'php',
        payment_method_types: ['card', 'paymaya', 'gcash', 'grabpay'],
        receipt_email: customerEmail,
        metadata: {
          bookingId: booking._id.toString(),
          gameId: gameId,
          gameName: game.title,
          numberOfPlayers: numberOfPlayers.toString(),
          customerName: customerName,
          isGuest: isGuest ? 'true' : 'false'
        },
        description: `Booking for ${game.title} - ${numberOfPlayers} player(s)`
      });

      // Create payment record
      const payment = new Payment({
        booking: booking._id,
        stripePaymentIntentId: paymentIntent.id,
        amount: totalAmount,
        currency: 'PHP',
        status: 'pending',
        customerEmail,
        customerName,
        paymentMethod: 'card' // Will be updated when payment completes
      });

      await payment.save();

      // Link payment to booking
      booking.payment = payment._id;
      await booking.save();

      logger.info(`Payment intent created: ${paymentIntent.id} for booking ${booking._id}`);

      res.json({
        clientSecret: paymentIntent.client_secret,
        bookingId: booking._id,
        paymentId: payment._id,
        amount: totalAmount,
        currency: 'PHP'
      });

    } catch (error) {
      logger.error('Error creating payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent', message: error.message });
    }
  }
);

// Confirm payment and update booking
router.post('/confirm-payment',
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('bookingId').isMongoId().withMessage('Invalid booking ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentIntentId, bookingId } = req.body;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Find payment record
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      // Find booking
      const booking = await Booking.findById(bookingId).populate('game');
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Update payment status
      if (paymentIntent.status === 'succeeded') {
        payment.status = 'succeeded';
        payment.stripePaymentMethodId = paymentIntent.payment_method;
        await payment.save();

        // Update booking status
        booking.status = 'confirmed';
        await booking.save();

        // Update game player count
        const game = await Game.findById(booking.game);
        game.currentPlayers += booking.numberOfPlayers;
        game.updateStatus();
        await game.save();

        logger.info(`Payment succeeded for booking ${booking._id}`);

        return res.json({
          success: true,
          booking: booking,
          payment: payment
        });
      } else {
        payment.status = paymentIntent.status;
        await payment.save();

        return res.status(400).json({
          error: 'Payment not completed',
          status: paymentIntent.status
        });
      }

    } catch (error) {
      logger.error('Error confirming payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment', message: error.message });
    }
  }
);

// Webhook for Stripe events (for production)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info('PaymentIntent succeeded:', paymentIntent.id);

      // Update payment and booking status
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = 'succeeded';
        await payment.save();

        const booking = await Booking.findById(payment.booking).populate('game');
        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed';
          await booking.save();

          // Update game player count
          const game = await Game.findById(booking.game);
          game.currentPlayers += booking.numberOfPlayers;
          game.updateStatus();
          await game.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.error('PaymentIntent failed:', failedPayment.id);

      const failedPaymentRecord = await Payment.findOne({ stripePaymentIntentId: failedPayment.id });
      if (failedPaymentRecord) {
        failedPaymentRecord.status = 'failed';
        failedPaymentRecord.errorMessage = failedPayment.last_payment_error?.message;
        await failedPaymentRecord.save();
      }
      break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
