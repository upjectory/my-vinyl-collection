// Setup filter toggle functionality
const filterToggle = document.getElementById('filter-toggle');
const filtersSection = document.getElementById('filters');
const filterToggleIcon = document.getElementById('filter-toggle-icon');
let filtersVisible = false;

function toggleFilters() {
    filtersVisible = !filtersVisible;
    filtersSection.style.display = filtersVisible ? 'block' : 'none';
    filterToggleIcon.classList.toggle('open', filtersVisible);
}

filterToggle.addEventListener('click', toggleFilters);

// Utility function to detect network changes and optimize loading
function setupNetworkObserver() {
    if (!navigator.connection) return; // Not supported
    
    const connection = navigator.connection;
    
    // Log initial connection type
    console.log(`Initial connection type: ${connection.effectiveType}`);
    
    // Listen for connection changes
    connection.addEventListener('change', () => {
        console.log(`Connection changed to ${connection.effectiveType}`);
        // The request queue will automatically use the new values via the getter
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupNetworkObserver();
    fetchVinylData();
});

// Function to safely open Spotify URL in a new tab
function openSpotifyUrl(url) {
    if (url && typeof url === 'string' && url.trim() !== '') {
        // Add https:// if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Check if running in Chrome on iOS
        const isChromeiOS = /CriOS/.test(navigator.userAgent);
        
        if (isChromeiOS) {
            // For Chrome on iOS, create a temporary link element
            // This approach works better with Chrome's security model
            const tempLink = document.createElement('a');
            tempLink.setAttribute('href', url);
            tempLink.setAttribute('target', '_blank');
            tempLink.setAttribute('rel', 'noopener noreferrer');
            
            // Temporarily append to document and click programmatically
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(tempLink);
            }, 100);
        } else {
            // Regular window.open for other browsers
            window.open(url, '_blank');
        }
        
        return true;
    }
    return false;
}

// Robust favorite detection function
function isFavorite(favoriteValue) {
    console.log('Checking favorite:', favoriteValue);
    
    if (favoriteValue === null || favoriteValue === undefined) return false;
    
    const normalizedValue = String(favoriteValue).trim().toLowerCase();
    return normalizedValue === 'yes' || normalizedValue === 'true';
}

// Function to detect EP status
function isEP(epValue) {
    console.log('Checking EP status:', epValue);
    
    if (epValue === null || epValue === undefined) return false;
    
    const normalizedValue = String(epValue).trim().toLowerCase();
    return normalizedValue === 'yes' || normalizedValue === 'true';
}

// Function to display albums
function displayAlbums(albums) {
    const albumsGrid = document.getElementById('albums-grid');
    
    // Clear existing albums
    albumsGrid.innerHTML = '';
    
    // Show message if no albums match the filters
    if (albums.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No albums match your filters.';
        albumsGrid.appendChild(noResults);
        return;
    }

    // Queue for managing API requests with device-aware limits
    const requestQueue = {
        queue: [],
        running: 0,
        
        // Determine optimal concurrent requests based on device and network
        get maxConcurrent() {
            // Check if running on a mobile device
            const isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent);
            
            // Check for connection info if available (modern browsers)
            if (navigator.connection) {
                const conn = navigator.connection;
                
                // Slow connection detection
                if (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
                    console.log('Detected slow connection, limiting concurrent requests to 1');
                    return 1; // Minimize requests on very slow connections
                }
                
                // Medium speed connection (3G)
                if (conn.effectiveType === '3g') {
                    console.log('Detected 3G connection, limiting concurrent requests to 2');
                    return isMobile ? 1 : 2; // More conservative on mobile
                }
                
                // Fast connection but on mobile
                if (isMobile) {
                    console.log('Detected mobile device, limiting concurrent requests to 2');
                    return 2; // Conservative default for mobile
                }
            } else if (isMobile) {
                // Fallback for browsers without Connection API but on mobile
                console.log('Mobile device detected, limiting concurrent requests');
                return 2;
            }
            
            // Desktop with good connection (default)
            return 4; // Slightly increased from original 3 for modern connections
        },
        
        // Rest of the request queue implementation...
        add: function(url, imageElement, album) {
            this.queue.push({url, imageElement, album});
            this.processNext();
        },
        
        // The processNext method should remain as implemented in previous step
        processNext: function() {
            if (this.running >= this.maxConcurrent || this.queue.length === 0) return;
            
            const nextRequest = this.queue.shift();
            this.running++;
            
            fetchWithRetry(nextRequest.url)
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    nextRequest.imageElement.src = data.results[0].artworkUrl100.replace('100x100', '400x400');
                    // If we found artwork through API, remove the no-artwork class
                    const cardElement = nextRequest.imageElement.closest('.album-card');
                    if (cardElement) {
                        cardElement.classList.remove('no-artwork');
                    }
                } else {
                    // Check if this is a proxy fallback request
                    if (nextRequest.album._proxyFallback) {
                        nextRequest.album._onProxyError();
                    } else {
                        nextRequest.imageElement.onerror();
                    }
                }
            })
            .catch(error => {
                // Check if this is a proxy fallback request
                if (nextRequest.album._proxyFallback) {
                    nextRequest.album._onProxyError();
                } else {
                    nextRequest.imageElement.onerror();
                }
            })
            .finally(() => {
                this.running--;
                setTimeout(() => this.processNext(), 300); // Add delay between requests
            });
        }
    };
    
    // Create album cards
    albums.forEach((album) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        
        // Add favorite class to highlight favorite albums
        if (isFavorite(album.isfavorite)) {
            card.classList.add('favorite');
        }
        
        // Add no-artwork class if no artwork URL is provided
        const hasArtwork = album.artwork && album.artwork.trim() !== '';
        if (!hasArtwork) {
            card.classList.add('no-artwork');
        }

        const imageContainer = document.createElement('div');
        imageContainer.className = 'album-image-container';

        // Make entire card clickable if Spotify URL exists
        let spotifyLink = null;
        for (const key in album) {
            if (key.toLowerCase().includes('spotify')) {
                spotifyLink = album[key];
                break;
            }
        }

        if (spotifyLink && spotifyLink.trim() !== '') {
            card.classList.add('spotify-enabled');
            card.dataset.spotifyUrl = spotifyLink;
            card.addEventListener('click', function() {
                const url = this.dataset.spotifyUrl;
                openSpotifyUrl(url);
            });
        }

        // Create image element
        const image = document.createElement('img');
        image.className = 'album-image loading';
        image.alt = `${album.title} by ${album.artist}`;
        image.loading = "lazy"; // Native lazy loading
        image.width = 300;  // Set explicit dimensions
        image.height = 300; // to prevent layout shifts
        image.decoding = "async"; // Use async decoding for better performance

        // Handle image loading events
        image.onload = function() {
            image.classList.remove('loading');
            // Add a loaded class that we can style
            image.classList.add('loaded');
        };

        // Handle image loading errors
        image.onerror = function() {
            image.classList.remove('loading');
            image.classList.add('error');
            
            // Use the default background image for all error cases
            this.src = 'https://iili.io/HlHy9Yx.png';
        };

        // Set initial image source
        if (!hasArtwork) {
            // Set initial source to the default background for albums without artwork
            image.src = 'https://iili.io/HlHy9Yx.png';
        } else {
            // For albums with artwork, use a smaller, optimized placeholder while loading
            const tempPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzEyMTIxMiIvPjwvc3ZnPg==';
            image.src = tempPlaceholder;
        }

        // Set up IntersectionObserver for lazy loading iTunes artwork
        const loadArtwork = () => {
            if (album.artwork && album.artwork.trim() !== '') {
                image.src = album.artwork;
            } else if (album.artist && album.title) {
                // Try to get artwork from iTunes API if missing
                const searchTerm = encodeURIComponent(`${album.artist} ${album.title}`);

                // Use multiple CORS proxies with fallback mechanism
                const proxyUrls = [
                    'https://corsproxy.io/?',
                    'https://api.allorigins.win/raw?url=',
                    'https://cors-anywhere.herokuapp.com/',
                ];

                // Start with the first proxy
                const fetchWithProxyFallback = (proxyIndex = 0) => {
                    // If we've tried all proxies and none worked, use error handler
                    if (proxyIndex >= proxyUrls.length) {
                        console.warn(`All proxies failed for ${album.artist} - ${album.title}`);
                        image.classList.remove('loading');
                        image.onerror();
                        return;
                    }

                    // Construct URL with current proxy
                    const itunesApiUrl = `https://itunes.apple.com/search?term=${searchTerm}&media=music&entity=album&limit=1`;
                    const proxyUrl = proxyUrls[proxyIndex] + encodeURIComponent(itunesApiUrl);
                    
                    // Add to request queue with custom error handling for fallback
                    const originalProcessNext = requestQueue.processNext;
                    
                    requestQueue.add(proxyUrl, image, {
                        ...album,
                        _proxyFallback: true,
                        _proxyIndex: proxyIndex,
                        _onProxyError: () => {
                            console.log(`Proxy ${proxyIndex + 1}/${proxyUrls.length} failed, trying next...`);
                            fetchWithProxyFallback(proxyIndex + 1);
                        }
                    });
                };

                // Start the proxy fallback process
                fetchWithProxyFallback();
            } else {
                // No artwork and insufficient info for API search
                image.classList.remove('loading');
                image.onerror();
            }
        };

        // Set up intersection observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadArtwork();
                    observer.disconnect(); // Stop observing once loaded
                }
            });
        }, {rootMargin: "200px"}); // Load when within 200px of viewport

        // Start observing
        observer.observe(imageContainer);

        // Add the image to container
        imageContainer.appendChild(image);

        // Now add text overlay ONLY for albums without artwork
        if (!hasArtwork) {
            // Create overlay for text display
            const textOverlay = document.createElement('div');
            textOverlay.className = 'album-missing-overlay';
            textOverlay.innerHTML = `
                <div class="album-missing-artist">${album.artist || 'Unknown Artist'}</div>
                <div class="album-missing-title">${album.title || 'Unknown Title'}</div>
            `;
            
            // Append overlay to image container
            imageContainer.appendChild(textOverlay);
        }

        // Add category tag if present
        if (album.category) {
            const category = document.createElement('div');
            category.className = 'album-category';
            category.textContent = album.category;
            imageContainer.appendChild(category);
        }
        
        // Add favorite badge if true
        if (isFavorite(album.isfavorite)) {
            const favorite = document.createElement('div');
            favorite.className = 'album-favorite-badge';
            favorite.innerHTML = '★';
            imageContainer.appendChild(favorite);
        }        

        // Add EP tag if true
        if (isEP(album.isep)) {
            const epTag = document.createElement('div');
            epTag.className = 'album-ep-tag';
            epTag.textContent = 'EP';
            imageContainer.appendChild(epTag);
        }
        
        const info = document.createElement('div');
        info.className = 'album-info';
        
        const title = document.createElement('h3');
        title.className = 'album-title';
        title.textContent = album.title || 'Unknown Title';
        
        const artist = document.createElement('p');
        artist.className = 'album-artist';
        artist.textContent = album.artist || 'Unknown Artist';
        
        const meta = document.createElement('div');
        meta.className = 'album-meta';
        
        // Improved year display with better styling
        const year = document.createElement('span');
        year.className = 'album-year';
        year.textContent = album.year || '';
        
        // Improved genre display with better styling
        const genre = document.createElement('span');
        genre.className = 'album-genre';
        genre.textContent = album.genre || '';
        
        meta.appendChild(year);
        meta.appendChild(genre);
        
        info.appendChild(title);
        info.appendChild(artist);
        info.appendChild(meta);
        
        card.appendChild(imageContainer);
        card.appendChild(info);
        
        albumsGrid.appendChild(card);
    });
}

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Load data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupNetworkObserver();
    fetchVinylData();
});
