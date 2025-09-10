// WanderLust Interactive Features

document.addEventListener("DOMContentLoaded", function () {
  // Filter functionality
  const filterItems = document.querySelectorAll(".filter-item");
  const listings = document.querySelectorAll(".listing-card");

  filterItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all filters
      filterItems.forEach((i) => i.classList.remove("active"));
      // Add active class to clicked filter
      this.classList.add("active");

      const category = this.querySelector(".filter-label").textContent;
      filterListings(category);
    });
  });

  function filterListings(category) {
    listings.forEach((listing) => {
      // Get the listing's category from data attribute or content
      const listingCategory = listing.getAttribute("data-category") || "Rooms";

      if (category === "Trending" || listingCategory === category) {
        listing.style.display = "block";
        listing.style.opacity = "1";
        listing.style.transform = "scale(1)";
      } else {
        listing.style.opacity = "0.5";
        listing.style.transform = "scale(0.95)";
        // Hide non-matching listings after animation
        setTimeout(() => {
          if (listing.style.opacity === "0.5") {
            listing.style.display = "none";
          }
        }, 300);
      }
    });

    // Show "no results" message if needed
    const visibleListings = document.querySelectorAll(
      '.listing-card[style*="display: block"], .listing-card:not([style*="display: none"])'
    );
    showNoResultsMessage(visibleListings.length === 0);
  }

  function showNoResultsMessage(show) {
    let noResults = document.getElementById("no-results");
    if (show) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.id = "no-results";
        noResults.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #717171;">
                        <i class="fa-solid fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No listings found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                    </div>
                `;
        document
          .querySelector(".listings-grid .container")
          .appendChild(noResults);
      }
      noResults.style.display = "block";
    } else if (noResults) {
      noResults.style.display = "none";
    }
  }

  // Search functionality - now handled server-side
  const searchForm = document.querySelector(".search-form");

  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      // Show loading state
      showLoading();

      // Let the form submit naturally to the server
      // The server will handle the search and return filtered results
    });
  }

  // Tax toggle functionality
  const taxToggle = document.getElementById("taxToggle");
  if (taxToggle) {
    taxToggle.addEventListener("change", function () {
      const prices = document.querySelectorAll(".listing-price");
      const taxRate = 0.18; // 18% GST

      prices.forEach((price) => {
        const priceText = price.textContent;
        const basePrice = parseFloat(priceText.replace(/[^\d]/g, ""));

        if (this.checked) {
          const totalPrice = basePrice * (1 + taxRate);
          price.innerHTML = `₹${totalPrice.toLocaleString("en-IN")} <span style="font-weight: 400;">night</span> <span style="color: #717171; font-size: 0.8rem;">+18% GST</span>`;
        } else {
          price.innerHTML = `₹${basePrice.toLocaleString("en-IN")} <span style="font-weight: 400;">night</span>`;
        }
      });
    });
  }

  // Favorite button functionality
  const favoriteButtons = document.querySelectorAll(".favorite-button");

  favoriteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const icon = this.querySelector("i");
      if (icon.classList.contains("fa-regular")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        this.style.transform = "scale(1.1)";

        // Add to favorites (in a real app, this would save to database)
        console.log("Added to favorites");

        // Show success message
        showToast("Added to favorites!", "success");
      } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        this.style.transform = "scale(1)";

        // Remove from favorites
        console.log("Removed from favorites");

        // Show success message
        showToast("Removed from favorites!", "info");
      }
    });
  });

  // Show map button functionality
  const showMapButton = document.querySelector(".show-map-button");
  if (showMapButton) {
    showMapButton.addEventListener("click", function () {
      // In a real implementation, this would toggle map view
      console.log("Show map clicked");
      this.innerHTML = '<i class="fa-solid fa-list"></i> Show list';

      // Toggle between map and list view
      const isMapView = this.innerHTML.includes("Show list");
      if (isMapView) {
        this.innerHTML = '<i class="fa-solid fa-play"></i> Show map';
        // Show map view
        showMapView();
      } else {
        this.innerHTML = '<i class="fa-solid fa-list"></i> Show list';
        // Show list view
        showListView();
      }
    });
  }

  function showMapView() {
    // Implementation for map view
    console.log("Showing map view");
  }

  function showListView() {
    // Implementation for list view
    console.log("Showing list view");
  }

  // Loading states
  function showLoading() {
    const listingsGrid = document.querySelector(".listings-grid");
    if (listingsGrid) {
      listingsGrid.classList.add("loading");
    }
  }

  function hideLoading() {
    const listingsGrid = document.querySelector(".listings-grid");
    if (listingsGrid) {
      listingsGrid.classList.remove("loading");
    }
  }

  // Smooth scrolling for filters
  const filtersContainer = document.querySelector(".filters-container");
  if (filtersContainer) {
    filtersContainer.addEventListener("wheel", function (e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    });
  }

  // Image carousel dots functionality
  const imageDots = document.querySelectorAll(".image-dot");
  imageDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      // Remove active class from all dots
      imageDots.forEach((d) => d.classList.remove("active"));
      // Add active class to clicked dot
      this.classList.add("active");

      // In a real implementation, this would change the image
      console.log("Image changed to:", index + 1);
    });
  });

  // Add hover effects for listing cards
  listings.forEach((listing) => {
    listing.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.02)";
    });

    listing.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });

  // Responsive search form
  const searchInputs = document.querySelectorAll(".search-input");
  searchInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.backgroundColor = "#f7f7f7";
      this.parentElement.style.borderRadius = "1rem";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.backgroundColor = "transparent";
      this.parentElement.style.borderRadius = "0";
    });
  });

  // Add smooth animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe listing cards for animation
  listings.forEach((listing) => {
    listing.style.opacity = "0";
    listing.style.transform = "translateY(20px)";
    listing.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(listing);
  });

  // Toast notification system
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-${type === "success" ? "check" : "info"}"></i>
                <span>${message}</span>
            </div>
        `;

    // Add toast styles
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#4CAF50" : "#2196F3"};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Add category data to listing cards
  listings.forEach((listing) => {
    const title = listing.querySelector(".listing-title")?.textContent || "";
    const location =
      listing.querySelector(".listing-location")?.textContent || "";

    // Determine category based on title/location (simplified logic)
    let category = "Rooms";
    if (
      title.toLowerCase().includes("beach") ||
      title.toLowerCase().includes("pool")
    ) {
      category = "Amazing Pools";
    } else if (
      title.toLowerCase().includes("mountain") ||
      title.toLowerCase().includes("ski")
    ) {
      category = "Mountains";
    } else if (title.toLowerCase().includes("castle")) {
      category = "Castles";
    } else if (
      title.toLowerCase().includes("camp") ||
      title.toLowerCase().includes("treehouse")
    ) {
      category = "Camping";
    } else if (title.toLowerCase().includes("farm")) {
      category = "Farms";
    } else if (
      location.toLowerCase().includes("new york") ||
      location.toLowerCase().includes("tokyo") ||
      location.toLowerCase().includes("paris")
    ) {
      category = "Iconic Cities";
    }

    listing.setAttribute("data-category", category);
  });
});

// Utility functions
function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export for use in other scripts
window.WanderLust = {
  formatPrice,
  debounce,
};
