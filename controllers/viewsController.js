const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const csp = {
  overview:
    "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com; connect-src 'self' ws://127.0.0.1:*; style-src 'self' https: 'unsafe-inline'; img-src 'self' data:; font-src 'self' https: data:; frame-src 'self' https://js.stripe.com; frame-ancestors 'self'; upgrade-insecure-requests;",
  tour: "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; frame-src 'self' https://js.stripe.com; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com blob: https://js.stripe.com; connect-src 'self' ws://127.0.0.1:* https://*.mapbox.com; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;",
  loginForm:
    "style-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://fonts.googleapis.com; script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com; connect-src 'self' ws://127.0.0.1:*; frame-src 'self' https://js.stripe.com;",
  account:
    "style-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://fonts.googleapis.com; script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com; connect-src 'self' ws://127.0.0.1:*; frame-src 'self' https://js.stripe.com;",
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get all the tour data from our collections
  const tours = await Tour.find();

  //2) Build template

  //3) Render that template from the tour data from step 1
  res
    .status(200)
    .set('Content-Security-Policy', csp.overview)
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }

  //2) Build template

  //3) Render the template using data from 1
  res
    .status(200)
    .set('Content-Security-Policy', csp.tour)
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  if (res.locals.user) {
    return res.redirect('/'); // Redirect to homepage or another page if user is logged in
  }

  res
    .status(200)
    .set('Content-Security-Policy', csp.loginForm)
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', csp.account)
    .render('account', {
      title: 'Your account',
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the returned IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res
    .status(200)
    .set('Content-Security-Policy', csp.account)
    .render('account', {
      title: 'Your account',
      user: updatedUser,
    });
});
