// Search and Filter Functionality
document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const categoryFilter = document.getElementById("categoryFilter");
  const filterItems = document.querySelectorAll(".filter-item");
  const advancedFiltersBtn = document.getElementById("advancedFiltersBtn");

  // Handle category filter clicks
  filterItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      filterItems.forEach((f) => f.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Update hidden category input
      const category = this.getAttribute("data-category");
      categoryFilter.value = category;

      // Submit form automatically for category filtering
      searchForm.submit();
    });
  });

  // Handle search form submission
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const params = new URLSearchParams();

    // Add form data to params
    for (let [key, value] of formData.entries()) {
      if (value.trim() !== "") {
        params.append(key, value);
      }
    }

    // Redirect to search results
    window.location.href = `/listings/search?${params.toString()}`;
  });

  // Advanced filters modal functionality
  if (advancedFiltersBtn) {
    advancedFiltersBtn.addEventListener("click", function () {
      showAdvancedFiltersModal();
    });
  }

  // Function to show advanced filters modal
  function showAdvancedFiltersModal() {
    const modal = document.createElement("div");
    modal.className = "advanced-filters-modal";
    modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Filters</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="filter-group">
                            <label>Price Range (per night)</label>
                            <div class="price-inputs">
                                <input type="number" id="modalMinPrice" placeholder="Min price" min="0">
                                <span>to</span>
                                <input type="number" id="modalMaxPrice" placeholder="Max price" min="0">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Property Type</label>
                            <div class="property-types">
                                <button type="button" class="property-type-btn" data-category="Rooms">Rooms</button>
                                <button type="button" class="property-type-btn" data-category="Trending">Trending</button>
                                <button type="button" class="property-type-btn" data-category="Mountains">Mountains</button>
                                <button type="button" class="property-type-btn" data-category="Castles">Castles</button>
                                <button type="button" class="property-type-btn" data-category="Camping">Camping</button>
                                <button type="button" class="property-type-btn" data-category="Farms">Farms</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="clear-filters-btn">Clear all</button>
                        <button class="apply-filters-btn">Show results</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Add modal styles
    const modalStyles = `
            <style>
                .advanced-filters-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                }
                
                .modal-overlay {
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 1rem;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #ebebeb;
                }
                
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #717171;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .filter-group {
                    margin-bottom: 2rem;
                }
                
                .filter-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #222222;
                }
                
                .price-inputs {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .price-inputs input {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid #ebebeb;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                }
                
                .property-types {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.5rem;
                }
                
                .property-type-btn {
                    padding: 0.75rem;
                    border: 1px solid #ebebeb;
                    border-radius: 0.5rem;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                
                .property-type-btn:hover,
                .property-type-btn.active {
                    border-color: #222222;
                    background-color: #f7f7f7;
                }
                
                .modal-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: 1.5rem;
                    border-top: 1px solid #ebebeb;
                }
                
                .clear-filters-btn,
                .apply-filters-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .clear-filters-btn {
                    background: white;
                    border: 1px solid #ebebeb;
                    color: #222222;
                }
                
                .apply-filters-btn {
                    background: #222222;
                    border: none;
                    color: white;
                }
                
                .clear-filters-btn:hover {
                    background: #f7f7f7;
                }
                
                .apply-filters-btn:hover {
                    background: #000000;
                }
            </style>
        `;

    document.head.insertAdjacentHTML("beforeend", modalStyles);

    // Modal event listeners
    const closeModal = modal.querySelector(".close-modal");
    const clearFiltersBtn = modal.querySelector(".clear-filters-btn");
    const applyFiltersBtn = modal.querySelector(".apply-filters-btn");
    const propertyTypeBtns = modal.querySelectorAll(".property-type-btn");
    const modalMinPrice = modal.querySelector("#modalMinPrice");
    const modalMaxPrice = modal.querySelector("#modalMaxPrice");

    // Populate current values
    modalMinPrice.value = document.getElementById("minPriceFilter").value;
    modalMaxPrice.value = document.getElementById("maxPriceFilter").value;

    const currentCategory = categoryFilter.value;
    propertyTypeBtns.forEach((btn) => {
      if (btn.getAttribute("data-category") === currentCategory) {
        btn.classList.add("active");
      }
    });

    // Property type selection
    propertyTypeBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        propertyTypeBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      });
    });

    // Close modal
    closeModal.addEventListener("click", () => modal.remove());
    modal.querySelector(".modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) modal.remove();
    });

    // Clear filters
    clearFiltersBtn.addEventListener("click", function () {
      modalMinPrice.value = "";
      modalMaxPrice.value = "";
      propertyTypeBtns.forEach((btn) => btn.classList.remove("active"));
    });

    // Apply filters
    applyFiltersBtn.addEventListener("click", function () {
      // Update hidden inputs
      document.getElementById("minPriceFilter").value = modalMinPrice.value;
      document.getElementById("maxPriceFilter").value = modalMaxPrice.value;

      const activePropertyType = modal.querySelector(
        ".property-type-btn.active"
      );
      if (activePropertyType) {
        categoryFilter.value = activePropertyType.getAttribute("data-category");
      }

      // Submit form
      searchForm.submit();
      modal.remove();
    });
  }

  // Real-time search functionality for location input
  const locationInput = document.querySelector('input[name="location"]');
  if (locationInput) {
    let searchTimeout;
    locationInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (this.value.length >= 3) {
          // Could implement autocomplete here
          console.log("Searching for:", this.value);
        }
      }, 300);
    });
  }
});
