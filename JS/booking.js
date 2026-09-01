// =========================
        // MODAL FUNCTIONALITY
        // =========================
        
        /**
         * Opens the booking modal and sets the selected service
         * @param {string} serviceName - The name of the service being booked
         */
        function openBookingModal(serviceName) {
            const modal = document.getElementById('bookingModal');
            const serviceInput = document.getElementById('selectedService');
            
            // Set the service name in the hidden form field
            serviceInput.value = serviceName;
            
            // Add active class to show modal with animation
            modal.classList.add('active');
            
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        /**
         * Closes the booking modal and resets the form
         */
        function closeBookingModal() {
            const modal = document.getElementById('bookingModal');
            const form = document.getElementById('bookingForm');
            const successMessage = document.getElementById('successMessage');
            
            // Remove active class to hide modal
            modal.classList.remove('active');
            
            // Reset form and hide success message
            form.reset();
            successMessage.classList.remove('show');
            form.style.display = 'flex';
            
            // Restore background scrolling
            document.body.style.overflow = 'auto';
        }

        // Close modal when clicking outside of it
        document.getElementById('bookingModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeBookingModal();
            }
        });

        // Close modal when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeBookingModal();
            }
        });

        // =========================
        // FORM SUBMISSION HANDLING
        // =========================
        
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            const form = e.target;
            const submitButton = document.getElementById('submitButton');
            const successMessage = document.getElementById('successMessage');
            
            // Disable submit button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            // Create FormData object to send form data
            const formData = new FormData(form);
            
            // Submit form to Formspree
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Success - show success message and hide form
                    successMessage.classList.add('show');
                    form.style.display = 'none';
                    
                    // Auto-close modal after 3 seconds
                    setTimeout(() => {
                        closeBookingModal();
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                // Error handling
                alert('There was an error submitting your request. Please try again or contact us directly.');
                console.error('Form submission error:', error);
            })
            .finally(() => {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Request';
            });
        });

        // =========================
        // SMOOTH SCROLLING FOR NAVIGATION
        // =========================
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });