import axios from 'axios';
import { showAlert } from './alert';

var stripe;
var setStripe = setInterval(function () {
  if (typeof Stripe === 'function') {
    stripe = Stripe(
      'pk_test_51Pqxu5DHGFqPNiLZdSnkIRpCbgUUTCYbEYz2XCRSyZkpKZrew91l9GPRT79oWEoI69jRgFYRDuzp5rrkYnWJqisG00IkgP8EYx',
    );
    clearInterval(setStripe);
  }
}, 500);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from endpoint
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // Create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
