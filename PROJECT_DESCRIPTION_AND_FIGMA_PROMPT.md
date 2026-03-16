# Wanderlust — Project Description & Figma AI Prompt

---

## Project Description

**Wanderlust** is an Airbnb-style travel and vacation rental platform built with **Node.js**, **Express**, **MongoDB**, and **EJS**. Users can browse property listings, add their own properties, read and write reviews, and search for accommodations by location, category, and price. The platform mimics core features of Airbnb.

### Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** EJS templates, Bootstrap, CSS
- **Authentication:** Passport.js (local strategy)
- **Services:** Cloudinary (images), Mapbox (maps & geocoding)
- **Validation:** Joi

### Core Features
- User signup, login, logout
- Create, edit, delete property listings (with image upload)
- Search by location; filters by category and price
- Reviews with star ratings
- Interactive Mapbox maps for listing locations
- Categories: Trending, Rooms, Iconic Cities, Mountains, Castles, Camping, Farms, Arctic, Amazing Pools, Domes, Boats
- Responsive UI, flash messages, user dropdown menu

### Current UI Style
- Airbnb-inspired design
- Hero section with search bar
- Horizontal category filters
- Listing cards with image, rating, price, location
- Detail page: hero image, booking widget, reviews, map
- Primary color: #ff385c
- Clean, minimalist layout with rounded corners and subtle shadows

---

## Figma AI Prompt

```
Design a modern, Airbnb-inspired UI for Wanderlust, a vacation rental web application.

**Platform:** Web (desktop and mobile responsive)

**Overall style:**
- Clean, minimal, trustworthy
- Airbnb-like layout and interactions
- Primary accent: #ff385c
- Secondary neutrals: #222222, #717171, #ebebeb
- Ample whitespace, rounded corners (0.5rem–2rem), subtle shadows

**Pages to design:**

1. **Home / Listings Index**
   - Hero section with large search bar (location input, search button)
   - Horizontal scrollable category filters (Trending, Rooms, Mountains, Castles, etc.) with icons
   - Grid of listing cards (4 cols desktop, 2 tablet, 1 mobile)
   - Each card: image, heart icon (favorites), rating, “Guest favourite” badge, location, title, price per night
   - “Show map” button at bottom

2. **Listing Detail Page**
   - Hero image with gradient overlay and title/location
   - Two-column layout: main content (description, host info, amenities, reviews) + sticky booking widget
   - Booking widget: price per night, check-in/check-out dates, guests selector, “Reserve” button
   - Owner avatar and info, “What this place offers” amenities grid
   - Reviews section with star rating and “Leave a Review” form
   - Map section titled “Where you’ll be”

3. **Search Results Page**
   - Same as index but with “Search results for [location]” and result count
   - Active filters displayed, clear filters option

4. **Navbar (global)**
   - Logo (compass icon + Wanderlust)
   - Tabs: Stays, Experiences
   - Right side: “Wanderlust your home”, Sign up, Log in (or user avatar with dropdown: Profile, My Bookings, Add Listing, Log out)

5. **Auth Pages (Sign Up / Log In)**
   - Centered form, simple and minimal
   - Fields: email, username, password
   - Primary CTA button using #ff385c

6. **Add/Edit Listing Form**
   - Form fields: title, description, image upload, price, country, location
   - Category dropdown
   - Submit button

7. **Reviews Index (standalone)**
   - Filters: experience type, rating, verified, featured
   - Paginated grid of review cards with author, rating, listing link
   - Each card links to a full review page

**Components to include:**
- Search bar with rounded pill shape
- Listing card with hover state
- Star rating display
- Form inputs with focus state
- Primary and secondary buttons
- Dropdown menus
- Modal for advanced filters

**Accessibility & responsiveness:**
- Touch-friendly targets on mobile
- Clear focus states
- Breakpoints: mobile (< 768px), tablet (768–1024px), desktop (> 1024px)
```

---
