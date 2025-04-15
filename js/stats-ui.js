// stats-ui.js - UI component for displaying vinyl collection statistics
// This module creates and manages the statistics modal interface

// Add this flag to track initialization status
let statsUIInitialized = false;

/**
 * Initialize the stats UI components
 * Creates the button and prepares the modal structure
 */
function initStatsUI() {
    // Prevent multiple initializations
    if (statsUIInitialized) {
        console.log('Stats UI already initialized, skipping');
        return;
    }
    
    console.log('Initializing Stats UI...');
    
    // Create the stats button in the header
    createStatsButton();
    
    // Create the modal container (hidden initially)
    createStatsModal();
    
    // Add event listeners for modal interaction
    setupEventListeners();
    
    // Add enhanced styles
    addEnhancedListeningTimeStyles();
    
    // Mark as initialized
    statsUIInitialized = true;
    
    console.log('Stats UI initialization complete');
}

/**
 * Create the stats button and add it to the page header
 */
function createStatsButton() {
    // First try to use the placeholder we added to the HTML
    let buttonContainer = document.getElementById('stats-button-placeholder');
    
    if (buttonContainer) {
        console.log('Found stats button placeholder, using it');
    } else {
        console.log('No stats button placeholder found, creating one');
        // Find the header element
        const header = document.querySelector('header .container') || document.querySelector('header');
        
        if (!header) {
            console.error('Could not find header element for stats button');
            return;
        }
        
        // Create button container
        buttonContainer = document.createElement('div');
        buttonContainer.className = 'stats-button-container';
        buttonContainer.id = 'stats-button-placeholder';
        
        // Check if there's a header-content div
        let headerContent = header.querySelector('.header-content');
        
        if (headerContent) {
            // If header content exists, append the button container to it
            headerContent.appendChild(buttonContainer);
            console.log('Appended button container to existing header-content');
        } else {
            // If no header content exists, just append directly to header
            header.appendChild(buttonContainer);
            console.log('Appended button container directly to header');
        }
    }
    
    // Create the button element if it doesn't already exist
    if (!document.getElementById('collection-stats-button')) {
        console.log('Creating stats button');
        const statsButton = document.createElement('button');
        statsButton.id = 'collection-stats-button';
        statsButton.className = 'stats-button';
        statsButton.setAttribute('aria-label', 'View Collection Statistics');
        
        // Add button text and icon
        statsButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stats-icon">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
            </svg>
            <span>Collection Stats</span>
        `;
        
        // Add to page
        buttonContainer.appendChild(statsButton);
        console.log('Stats button added to container');
    } else {
        console.log('Stats button already exists');
    }
}

/**
 * Create the stats modal structure (initially hidden)
 */
function createStatsModal() {
    // Check if modal already exists
    if (document.getElementById('stats-modal')) {
        return;
    }
    
    // Create the modal container
    const modal = document.createElement('div');
    modal.id = 'stats-modal';
    modal.className = 'stats-modal';
    modal.setAttribute('aria-labelledby', 'stats-modal-title');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    
    // Modal content structure
    modal.innerHTML = `
        <div class="stats-modal-backdrop"></div>
        <div class="stats-modal-content">
            <div class="stats-modal-header">
                <h2 id="stats-modal-title">Collection Statistics</h2>
                <button class="stats-modal-close" aria-label="Close statistics">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="stats-modal-body">
                <!-- Loading indicator shown initially -->
                <div id="stats-loading" class="stats-loading">
                    <div class="stats-spinner"></div>
                    <p>Analyzing your collection...</p>
                </div>
                
                <!-- Stats content will be loaded here -->
                <div id="stats-content" class="stats-content" style="display: none;">
                    <!-- Top stats overview section -->
                    <div class="stats-overview-cards">
                        <!-- Cards will be dynamically added here -->
                    </div>
                    
                    <!-- Tab navigation for detailed stats -->
                    <div class="stats-tabs">
                        <button class="stats-tab-btn active" data-tab="distribution">Distribution</button>
                        <button class="stats-tab-btn" data-tab="artists">Artists</button>
                        <button class="stats-tab-btn" data-tab="timeline">Timeline & Insights</button>
                    </div>
                    
                    <!-- Tab content containers -->
                    <div class="stats-tab-content">
                        <!-- Distribution tab (genres, decades, sizes) -->
                        <div id="distribution-tab" class="stats-tab-pane active">
                            <div class="stats-chart-container" id="genre-chart-container">
                                <h3>Genre Distribution</h3>
                                <div id="genre-chart" class="stats-chart"></div>
                            </div>
                            
                            <div class="stats-chart-row">
                                <div class="stats-chart-container" id="decade-chart-container">
                                    <h3>Decades Distribution</h3>
                                    <div id="decade-chart" class="stats-chart"></div>
                                </div>
                                
                                <div class="stats-chart-container" id="size-chart-container">
                                    <h3>Record Sizes</h3>
                                    <div id="size-chart" class="stats-chart"></div>
                                </div>
                            </div>
                            
                            <div class="stats-chart-container" id="ep-lp-container">
                                <h3>EPs vs LPs</h3>
                                <div id="ep-lp-chart" class="stats-chart"></div>
                            </div>
                        </div>
                        
                        <!-- Artists tab -->
                        <div id="artists-tab" class="stats-tab-pane">
                            <div class="stats-chart-container" id="top-artists-container">
                                <h3>Most Represented Artists</h3>
                                <div id="artists-chart" class="stats-chart"></div>
                            </div>
                            
                            <div class="stats-text-container" id="complete-discographies-container">
                                <h3>Potential Complete Discographies</h3>
                                <div id="complete-discographies" class="stats-text-content"></div>
                            </div>
                        </div>
                        
                        <!-- Timeline & Insights tab (merged) -->
                        <div id="timeline-tab" class="stats-tab-pane">
                            <div class="stats-chart-container" id="years-distribution-container">
                                <h3>Albums By Year</h3>
                                <div id="years-chart" class="stats-chart"></div>
                            </div>
                            
                            <div class="stats-text-container" id="year-range-container">
                                <h3>Collection Timespan</h3>
                                <div id="year-range" class="stats-text-content"></div>
                            </div>
                            
                            <div class="stats-text-container" id="listening-time-container">
                                <h3>Listening Marathon</h3>
                                <div id="listening-time" class="stats-text-content"></div>
                            </div>
                            
                            <div class="stats-chart-container" id="favorites-genre-container">
                                <h3>Favorites by Genre</h3>
                                <div id="favorites-genre-chart" class="stats-chart"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stats-modal-footer">
                <button id="stats-export-image" class="stats-export-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Save as Image
                </button>
                <button id="stats-close-button" class="stats-close-button">Close</button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
}

/**
 * Set up event listeners for the stats UI
 */
function setupEventListeners() {
    // Button click handler
    const statsButton = document.getElementById('collection-stats-button');
    if (statsButton) {
        statsButton.addEventListener('click', showStatsModal);
    }
    
    // Close button handlers
    const closeButtons = document.querySelectorAll('.stats-modal-close, #stats-close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', hideStatsModal);
    });
    
    // Backdrop click to close
    const backdrop = document.querySelector('.stats-modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', hideStatsModal);
    }
    
    // Tab navigation handlers
    const tabButtons = document.querySelectorAll('.stats-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            document.querySelectorAll('.stats-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.stats-tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const tabName = this.getAttribute('data-tab');
            const tabPane = document.getElementById(`${tabName}-tab`);
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
    
    // Export button handler
    const exportButton = document.getElementById('stats-export-image');
    if (exportButton) {
        exportButton.addEventListener('click', exportStatsAsImage);
    }
    
    // Keyboard handler (Escape to close)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('stats-modal');
            if (modal && modal.classList.contains('visible')) {
                hideStatsModal();
            }
        }
    });
}

/**
 * Show the stats modal and generate content
 */
function showStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (!modal) return;
    
    // Show modal with animation
    modal.classList.add('visible');
    
    // Focus the modal for accessibility
    modal.focus();
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('stats-loading');
    const statsContent = document.getElementById('stats-content');
    
    if (loadingIndicator && statsContent) {
        loadingIndicator.style.display = 'flex';
        statsContent.style.display = 'none';
    }
    
    // Log data availability to help with debugging
    console.log('Looking for album data sources...');
    if (window.vinylData && window.vinylData.albums) {
        console.log('Found vinylData.albums with', window.vinylData.albums.length, 'albums');
    } else {
        console.log('No vinylData.albums found');
    }
    
    if (window.albumsData) {
        console.log('Found albumsData with', window.albumsData.length, 'albums');
    } else {
        console.log('No albumsData found');
    }
    
    // Count albums in DOM
    const albumCards = document.querySelectorAll('.album-card');
    console.log('Found', albumCards.length, 'album cards in DOM');
    
    // Get current albums from the global state
    // Try multiple potential data sources
    let albums = [];
    
    // Try to find the albums array in the global scope
    if (window.vinylData && Array.isArray(window.vinylData.albums) && window.vinylData.albums.length > 0) {
        albums = window.vinylData.albums;
        console.log('Using vinylData.albums as data source');
    } else if (window.albumsData && Array.isArray(window.albumsData) && window.albumsData.length > 0) {
        albums = window.albumsData;
        console.log('Using albumsData as data source');
    } else if (window.albums && Array.isArray(window.albums) && window.albums.length > 0) {
        albums = window.albums;
        console.log('Using global albums array as data source');
    } else {
        // Try to get all album cards and extract data as a fallback
        if (albumCards.length > 0) {
            console.log('Extracting data from DOM elements as fallback');
            // This is a fallback that extracts limited data from the DOM
            albums = Array.from(albumCards).map(card => {
                const artist = card.querySelector('.album-artist')?.textContent || '';
                const title = card.querySelector('.album-title')?.textContent || '';
                const genre = card.querySelector('.album-genre')?.textContent || '';
                const year = card.querySelector('.album-year')?.textContent || '';
                const isFavorite = card.classList.contains('favorite');
                const isEP = card.querySelector('.album-ep-tag') !== null;
                
                return {
                    artist,
                    title,
                    genre,
                    year,
                    isfavorite: isFavorite ? 'yes' : 'no',
                    isep: isEP ? 'yes' : 'no'
                };
            });
            console.log('Extracted', albums.length, 'albums from DOM');
        } else {
            console.warn('No album data sources found');
        }
    }
    
    // Generate stats after a short delay to allow the modal animation to complete
    setTimeout(() => {
        if (albums && albums.length > 0) {
            console.log('Generating stats content with', albums.length, 'albums');
            generateStatsContent(albums);
        } else {
            // Show error in stats content
            if (statsContent) {
                loadingIndicator.style.display = 'none';
                statsContent.style.display = 'block';
                statsContent.innerHTML = `
                    <div class="stats-error">
                        <h3>Unable to Load Collection Data</h3>
                        <p>We couldn't find your vinyl collection data to analyze. Please make sure your collection has been loaded.</p>
                        <p class="stats-error-detail">Try refreshing the page and waiting for your collection to fully load before viewing statistics.</p>
                    </div>
                `;
            }
        }
    }, 500);
}

/**
 * Hide the stats modal
 */
function hideStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

/**
 * Generate all statistics content for the modal
 * @param {Array} albums - The array of album objects
 */
function generateStatsContent(albums) {
    // Calculate all stats
    const stats = window.VinylStats.calculateCollectionStats(albums);
    
    // Hide loading, show content
    const loadingIndicator = document.getElementById('stats-loading');
    const statsContent = document.getElementById('stats-content');
    
    if (loadingIndicator && statsContent) {
        loadingIndicator.style.display = 'none';
        statsContent.style.display = 'block';
    }
    
    // Generate each section of the stats UI
    generateOverviewCards(stats);
    generateDistributionCharts(stats);
    generateArtistCharts(stats);
    
    // For the merged Timeline & Insights tab
    generateTimelineCharts(stats);
    generateListeningTimeInfo(stats.listeningTime);
    generateFavoritesGenreChart(stats.favorites);
    
    // We're no longer generating the artwork color palette
}

/**
 * Add CSS styles for the enhanced listening time section
 */
function addEnhancedListeningTimeStyles() {
    // Check if styles are already added
    if (document.getElementById('enhanced-listening-time-styles')) {
        return;
    }
    
    const styles = document.createElement('style');
    styles.id = 'enhanced-listening-time-styles';
    styles.textContent = `
        .stats-fun-facts-title {
            margin-top: 20px;
            margin-bottom: 12px;
            color: #6200ee;
            font-size: 18px;
        }
        
        .stats-fun-list {
            list-style: none;
            padding: 0;
            margin: 0;
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
        }
        
        .stats-fun-list li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        .stats-fun-list li:last-child {
            margin-bottom: 0;
        }
        
        .stats-fun-list svg {
            margin-right: 8px;
            flex-shrink: 0;
            color: #6200ee;
            margin-top: 2px;
        }
        
        .stats-fun-list li span {
            flex: 1;
        }
        
        .stats-fun-list strong {
            color: #6200ee;
            padding: 0 2px;
        }
        
        @media (max-width: 768px) {
            .stats-fun-list li {
                margin-bottom: 16px;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

/**
 * Generate the overview cards with key stats
 * @param {Object} stats - The calculated collection statistics
 */
function generateOverviewCards(stats) {
    const cardsContainer = document.querySelector('.stats-overview-cards');
    if (!cardsContainer) return;
    
    // Clear existing content
    cardsContainer.innerHTML = '';
    
    // Create cards for key stats
    const cards = [
        {
            title: 'Records',
            value: stats.totalRecords,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>`
        },
        {
            title: 'Artists',
            value: stats.artists.uniqueArtists,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>`
        },
        {
            title: 'Genres',
            value: stats.genres.uniqueGenres,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>`
        },
        {
            title: 'Play Time',
            value: `${stats.listeningTime.displayTime.days}d ${stats.listeningTime.displayTime.hours}h`,
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>`
        }
    ];
    
    // Create and append each card
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'stats-card';
        cardElement.innerHTML = `
            <div class="stats-card-icon">${card.icon}</div>
            <div class="stats-card-content">
                <h3 class="stats-card-value">${card.value}</h3>
                <p class="stats-card-title">${card.title}</p>
            </div>
        `;
        cardsContainer.appendChild(cardElement);
    });
}

/**
 * Generate the distribution charts (genres, decades, sizes)
 * @param {Object} stats - The calculated collection statistics
 */
function generateDistributionCharts(stats) {
    // Generate genre chart
    generateGenreChart(stats.genres);
    
    // Generate decade chart
    generateDecadeChart(stats.decades);
    
    // Generate size chart
    generateSizeChart(stats.sizes);
    
    // Generate EP vs LP chart
    generateEpLpChart(stats.recordTypes);
}

/**
 * Generate the genre distribution chart
 * @param {Object} genreStats - The genre statistics data
 */
function generateGenreChart(genreStats) {
    const container = document.getElementById('genre-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Prepare data for chart
    // Take top 8 genres and group the rest as "Other"
    let chartData = [...genreStats.distribution];
    
    if (chartData.length > 8) {
        const topGenres = chartData.slice(0, 7);
        const otherGenres = chartData.slice(7);
        
        const otherCount = otherGenres.reduce((sum, genre) => sum + genre.count, 0);
        const otherPercentage = ((otherCount / genreStats.totalWithGenre) * 100).toFixed(1);
        
        topGenres.push({
            name: 'Other',
            count: otherCount,
            percentage: otherPercentage
        });
        
        chartData = topGenres;
    }
    
    // Create a donut chart for genres
    createDonutChart(container, chartData, 'name', 'count', 'percentage');
    
    // Add legend for the chart
    createChartLegend(container, chartData, 'name', 'percentage');
}

/**
 * Generate the decade distribution chart
 * @param {Object} decadeStats - The decade statistics data
 */
function generateDecadeChart(decadeStats) {
    const container = document.getElementById('decade-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create a bar chart for decades
    createBarChart(container, decadeStats.distribution, 'decade', 'count');
}

/**
 * Generate the record size distribution chart
 * @param {Object} sizeStats - The record size statistics data
 */
function generateSizeChart(sizeStats) {
    const container = document.getElementById('size-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create a donut chart for sizes
    createDonutChart(container, sizeStats.distribution, 'size', 'count', 'percentage');
    
    // Add legend for the chart
    createChartLegend(container, sizeStats.distribution, 'size', 'percentage');
}

/**
 * Generate the EP vs LP chart
 * @param {Object} recordTypes - The record type statistics
 */
function generateEpLpChart(recordTypes) {
    const container = document.getElementById('ep-lp-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Format data for chart
    const chartData = [
        {
            name: 'LPs',
            count: recordTypes.lps.count,
            percentage: recordTypes.lps.percentage
        },
        {
            name: 'EPs',
            count: recordTypes.eps.count,
            percentage: recordTypes.eps.percentage
        }
    ];
    
    // Create horizontal bar chart
    createHorizontalBarChart(container, chartData, 'name', 'count', 'percentage');
}

/**
 * Generate artist-related charts and information
 * @param {Object} stats - The calculated collection statistics
 */
function generateArtistCharts(stats) {
    // Generate top artists chart
    generateTopArtistsChart(stats.artists);
    
    // Generate complete discographies list
    generateCompleteDiscographiesList(stats.artists);
}

/**
 * Generate the top artists chart
 * @param {Object} artistStats - The artist statistics data
 */
function generateTopArtistsChart(artistStats) {
    const container = document.getElementById('artists-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Take only top 10 artists for the chart
    const topArtists = artistStats.mostRepresented.slice(0, 10);
    
    // Create a horizontal bar chart for top artists
    createHorizontalBarChart(container, topArtists, 'name', 'count');
}

/**
 * Generate the list of potential complete discographies
 * @param {Object} artistStats - The artist statistics data
 */
function generateCompleteDiscographiesList(artistStats) {
    const container = document.getElementById('complete-discographies');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    const discographies = artistStats.potentialCompleteDiscographies;
    
    if (discographies.length === 0) {
        container.innerHTML = '<p class="stats-no-data">No artists with 3+ albums found in your collection.</p>';
        return;
    }
    
    // Create list of artists
    const list = document.createElement('ul');
    list.className = 'stats-list';
    
    discographies.forEach(artist => {
        const item = document.createElement('li');
        
        // Find the count for this artist
        const artistData = artistStats.mostRepresented.find(a => a.name === artist);
        const count = artistData ? artistData.count : '3+';
        
        item.innerHTML = `<span class="artist-name">${artist}</span> <span class="artist-count">(${count} albums)</span>`;
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

/**
 * Generate timeline-related charts and information
 * @param {Object} stats - The calculated collection statistics
 */
function generateTimelineCharts(stats) {
    // Generate years distribution chart
    generateYearsChart(stats.years);
    
    // Generate year range information
    generateYearRangeInfo(stats.years);
}

/**
 * Generate the years distribution chart
 * @param {Object} yearStats - The year statistics data
 */
function generateYearsChart(yearStats) {
    const container = document.getElementById('years-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!yearStats.distribution || yearStats.distribution.length === 0) {
        container.innerHTML = '<p class="stats-no-data">No year data available for your collection.</p>';
        return;
    }
    
    // Create a line chart for years
    createLineChart(container, yearStats.distribution, 'year', 'count');
}

/**
 * Generate the year range information
 * @param {Object} yearStats - The year statistics data
 */
function generateYearRangeInfo(yearStats) {
    const container = document.getElementById('year-range');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (!yearStats.oldest || !yearStats.newest) {
        container.innerHTML = '<p class="stats-no-data">No year data available for your collection.</p>';
        return;
    }
    
    // Create content
    container.innerHTML = `
        <div class="stats-year-range">
            <div class="year-range-item">
                <span class="year-label">Oldest Album</span>
                <span class="year-value">${yearStats.oldest}</span>
            </div>
            <div class="year-range-item">
                <span class="year-label">Newest Album</span>
                <span class="year-value">${yearStats.newest}</span>
            </div>
            <div class="year-range-item">
                <span class="year-label">Timespan</span>
                <span class="year-value">${yearStats.span} years</span>
            </div>
        </div>
    `;
}

/**
 * Generate insights content
 * @param {Object} stats - The calculated collection statistics
 */
function generateInsightsContent(stats) {
    // Generate listening time information
    generateListeningTimeInfo(stats.listeningTime);
    
    // Generate favorites genre chart
    generateFavoritesGenreChart(stats.favorites);
    
    // Generate artwork color palette
    generateArtworkColorPalette(stats.colorAnalysis);
}

/**
 * Generate the listening time information with enhanced content
 * @param {Object} listeningTime - The listening time statistics
 */
function generateListeningTimeInfo(listeningTime) {
    const container = document.getElementById('listening-time');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Calculate additional fun statistics
    const albumsPerDay = Math.ceil(listeningTime.totalMinutes / 1440); // minutes in a day
    const marathonDays = Math.ceil(listeningTime.hours / 8); // 8 listening hours per day
    const roadTripDistance = Math.round(listeningTime.hours * 65); // avg 65 mph
    const novelCount = Math.floor(listeningTime.hours / 5); // avg 5 hours per novel
    
    // Format the road trip percentage more reliably
    const roadTripPercentage = Math.floor(2800/roadTripDistance*100);
    
    // Create content with enhanced information
    container.innerHTML = `
        <div class="stats-listening-time">
            <div class="listening-time-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="12" x2="14.5" y2="14.5"></line>
                </svg>
            </div>
            <div class="listening-time-text">
                <p class="listening-time-main">It would take <strong>${listeningTime.formattedTime}</strong> to listen to your entire collection.</p>
                <p class="listening-time-sub">That's approximately ${listeningTime.totalMinutes.toLocaleString()} minutes of music!</p>
            </div>
        </div>
        
        <h3 class="stats-fun-facts-title">Fun Facts About Your Collection</h3>
        <ul class="stats-fun-list">
            <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Listening to your collection 8 hours a day would take <strong>${marathonDays}</strong> days to complete.</span>
            </li>
            <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <span>You could listen to <strong>${albumsPerDay}</strong> albums per day for a full day and not repeat any music.</span>
            </li>
            <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>A coast-to-coast road trip from NY to LA (~2,800 miles) would let you listen to about <strong>${roadTripPercentage}%</strong> of your collection.</span>
            </li>
            <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>In the time it takes to listen to your entire collection, you could read <strong>${novelCount}</strong> novels (at 5 hours per book).</span>
            </li>
        </ul>
    `;
}

/**
 * Generate favorites genre chart
 * @param {Object} favoritesStats - The favorites statistics
 */
function generateFavoritesGenreChart(favoritesStats) {
    const container = document.getElementById('favorites-genre-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (favoritesStats.count === 0) {
        container.innerHTML = '<p class="stats-no-data">No favorites marked in your collection.</p>';
        return;
    }
    
    // Create content
    container.innerHTML = `
        <div class="stats-favorites-summary">
            <p>${favoritesStats.count} albums (${favoritesStats.percentage}% of your collection) are marked as favorites.</p>
        </div>
    `;
    
    if (favoritesStats.genreBreakdown && favoritesStats.genreBreakdown.length > 0) {
        // Create a pie chart for favorite genres
        const chartContainer = document.createElement('div');
        chartContainer.className = 'favorites-genre-chart-container';
        container.appendChild(chartContainer);
        
        createPieChart(chartContainer, favoritesStats.genreBreakdown, 'name', 'count');
        
        // Add legend for the chart
        createChartLegend(container, favoritesStats.genreBreakdown, 'name', 'percentage');
    }
}

/**
 * Generate artwork color palette visualization
 * @param {Object} colorAnalysis - The color analysis data
 */
function generateArtworkColorPalette(colorAnalysis) {
    const container = document.getElementById('artwork-colors');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create artwork coverage info
    container.innerHTML = `
        <div class="stats-artwork-coverage">
            <p>${colorAnalysis.albumsWithArtwork} albums (${colorAnalysis.coveragePercentage}% of your collection) have artwork.</p>
        </div>
    `;
    
    // Create color palette visualization
    const paletteContainer = document.createElement('div');
    paletteContainer.className = 'color-palette-container';
    
    colorAnalysis.colorPalette.forEach(color => {
        const colorBlock = document.createElement('div');
        colorBlock.className = 'color-block';
        colorBlock.style.backgroundColor = color;
        colorBlock.title = color;
        paletteContainer.appendChild(colorBlock);
    });
    
    container.appendChild(paletteContainer);
}

/**
 * Create a donut chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} labelKey - The key for item labels
 * @param {string} valueKey - The key for item values
 * @param {string} percentageKey - The key for percentage values (optional)
 */
function createDonutChart(container, data, labelKey, valueKey, percentageKey) {
    // For simplicity, we'll use a basic SVG implementation
    // In a production app, you might want to use a library like Chart.js
    
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    const donutWidth = 50;
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'donut-chart');
    
    // Create chart group and center it
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width/2},${height/2})`);
    
    // Colors for the chart segments
    const colors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
        '#5E35B1', '#D81B60', '#00ACC1', '#FB8C00',
        '#43A047', '#F44336', '#9C27B0', '#2196F3'
    ];
    
    // Calculate segments
    let startAngle = 0;
    data.forEach((item, index) => {
        const value = item[valueKey];
        const percentage = value / total;
        const endAngle = startAngle + (percentage * (Math.PI * 2));
        
        // Calculate path
        const x1 = radius * Math.sin(startAngle);
        const y1 = -radius * Math.cos(startAngle);
        const x2 = radius * Math.sin(endAngle);
        const y2 = -radius * Math.cos(endAngle);
        
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        
        // Create path for segment
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `
            M ${donutWidth * Math.sin(startAngle)} ${-donutWidth * Math.cos(startAngle)}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${donutWidth * Math.sin(endAngle)} ${-donutWidth * Math.cos(endAngle)}
            A ${donutWidth} ${donutWidth} 0 ${largeArcFlag} 0 ${donutWidth * Math.sin(startAngle)} ${-donutWidth * Math.cos(startAngle)}
        `);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '1');
        
        // Add tooltip data
        const percentageValue = percentageKey ? item[percentageKey] : ((value / total) * 100).toFixed(1);
        path.setAttribute('data-label', item[labelKey]);
        path.setAttribute('data-value', value);
        path.setAttribute('data-percentage', percentageValue);
        
        // Add tooltip behavior
        path.addEventListener('mouseenter', showTooltip);
        path.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(path);
        
        startAngle = endAngle;
    });
    
    // Add center circle for donut effect
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', 0);
    centerCircle.setAttribute('cy', 0);
    centerCircle.setAttribute('r', donutWidth);
    centerCircle.setAttribute('fill', '#fff');
    g.appendChild(centerCircle);
    
    // Add group to SVG
    svg.appendChild(g);
    
    // Add the chart to the container
    container.appendChild(svg);
}

/**
 * Create a pie chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} labelKey - The key for item labels
 * @param {string} valueKey - The key for item values
 */
function createPieChart(container, data, labelKey, valueKey) {
    // Similar to donut chart but without inner circle
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'pie-chart');
    
    // Create chart group and center it
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width/2},${height/2})`);
    
    // Colors for the chart segments
    const colors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
        '#5E35B1', '#D81B60', '#00ACC1', '#FB8C00'
    ];
    
    // Calculate segments
    let startAngle = 0;
    data.forEach((item, index) => {
        const value = item[valueKey];
        const percentage = value / total;
        const endAngle = startAngle + (percentage * (Math.PI * 2));
        
        // Calculate path
        const x1 = radius * Math.sin(startAngle);
        const y1 = -radius * Math.cos(startAngle);
        const x2 = radius * Math.sin(endAngle);
        const y2 = -radius * Math.cos(endAngle);
        
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        
        // Create path for segment
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '1');
        
        // Add tooltip data
        path.setAttribute('data-label', item[labelKey]);
        path.setAttribute('data-value', value);
        path.setAttribute('data-percentage', ((value / total) * 100).toFixed(1));
        
        // Add tooltip behavior
        path.addEventListener('mouseenter', showTooltip);
        path.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(path);
        
        startAngle = endAngle;
    });
    
    // Add group to SVG
    svg.appendChild(g);
    
    // Add the chart to the container
    container.appendChild(svg);
}

/**
 * Create a bar chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} labelKey - The key for item labels
 * @param {string} valueKey - The key for item values
 */
function createBarChart(container, data, labelKey, valueKey) {
    // For simplicity, we'll use a basic SVG implementation
    const width = 100 + (data.length * 40); // Allow enough width for all bars
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'bar-chart');
    
    // Create chart group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padding.left},${padding.top})`);
    
    // Create bars
    const barWidth = chartWidth / data.length;
    
    data.forEach((item, index) => {
        const value = item[valueKey];
        const barHeight = (value / maxValue) * chartHeight;
        const x = index * barWidth;
        const y = chartHeight - barHeight;
        
        // Create bar
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth - 5); // Gap between bars
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#4285F4');
        
        // Add tooltip data
        rect.setAttribute('data-label', item[labelKey]);
        rect.setAttribute('data-value', value);
        
        // Add tooltip behavior
        rect.addEventListener('mouseenter', showTooltip);
        rect.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(rect);
        
        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', chartHeight + 15);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.textContent = item[labelKey];
        g.appendChild(text);
        
        // Add value label
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', x + barWidth / 2);
        valueText.setAttribute('y', y - 5);
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('font-size', '12');
        valueText.setAttribute('fill', '#333');
        valueText.textContent = value;
        g.appendChild(valueText);
    });
    
    // Add X axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', chartHeight);
    xAxis.setAttribute('x2', chartWidth);
    xAxis.setAttribute('y2', chartHeight);
    xAxis.setAttribute('stroke', '#333');
    xAxis.setAttribute('stroke-width', '1');
    g.appendChild(xAxis);
    
    svg.appendChild(g);
    container.appendChild(svg);
}

/**
 * Create a horizontal bar chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} labelKey - The key for item labels
 * @param {string} valueKey - The key for item values
 * @param {string} percentageKey - The key for percentage values (optional)
 */
function createHorizontalBarChart(container, data, labelKey, valueKey, percentageKey) {
    const width = 300;
    const height = 30 + (data.length * 30); // Adjust height based on number of items
    const padding = { top: 20, right: 30, bottom: 10, left: 100 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'horizontal-bar-chart');
    
    // Create chart group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padding.left},${padding.top})`);
    
    // Create bars
    const barHeight = chartHeight / data.length;
    
    data.forEach((item, index) => {
        const value = item[valueKey];
        const barWidth = (value / maxValue) * chartWidth;
        const y = index * barHeight;
        
        // Create bar
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 0);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight - 5); // Gap between bars
        rect.setAttribute('fill', '#34A853');
        
        // Add tooltip data
        const percentage = percentageKey ? item[percentageKey] : ((value / maxValue) * 100).toFixed(1);
        rect.setAttribute('data-label', item[labelKey]);
        rect.setAttribute('data-value', value);
        rect.setAttribute('data-percentage', percentage);
        
        // Add tooltip behavior
        rect.addEventListener('mouseenter', showTooltip);
        rect.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(rect);
        
        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', -5);
        text.setAttribute('y', y + barHeight / 2);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '12');
        text.textContent = item[labelKey];
        g.appendChild(text);
        
        // Add value label
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', barWidth + 5);
        valueText.setAttribute('y', y + barHeight / 2);
        valueText.setAttribute('dominant-baseline', 'middle');
        valueText.setAttribute('font-size', '12');
        valueText.setAttribute('fill', '#333');
        valueText.textContent = value;
        g.appendChild(valueText);
    });
    
    // Add Y axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', chartHeight);
    yAxis.setAttribute('stroke', '#333');
    yAxis.setAttribute('stroke-width', '1');
    g.appendChild(yAxis);
    
    svg.appendChild(g);
    container.appendChild(svg);
}

/**
 * Create a line chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} xKey - The key for X-axis values
 * @param {string} yKey - The key for Y-axis values
 */
function createLineChart(container, data, xKey, yKey) {
    const width = 400;
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Sort data by x-axis value
    data.sort((a, b) => a[xKey] - b[xKey]);
    
    // Find min and max values for scaling
    const xValues = data.map(item => item[xKey]);
    const yValues = data.map(item => item[yKey]);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = 0; // Start Y axis at 0
    const maxY = Math.max(...yValues) * 1.1; // Add 10% padding at top
    
    // Scale values to chart dimensions
    const scaleX = value => ((value - minX) / (maxX - minX)) * chartWidth;
    const scaleY = value => chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'line-chart');
    
    // Create chart group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padding.left},${padding.top})`);
    
    // Create X and Y axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', chartHeight);
    xAxis.setAttribute('x2', chartWidth);
    xAxis.setAttribute('y2', chartHeight);
    xAxis.setAttribute('stroke', '#333');
    xAxis.setAttribute('stroke-width', '1');
    g.appendChild(xAxis);
    
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', chartHeight);
    yAxis.setAttribute('stroke', '#333');
    yAxis.setAttribute('stroke-width', '1');
    g.appendChild(yAxis);
    
    // Add X-axis labels (skip some if there are too many)
    const xLabelStep = Math.ceil(data.length / 10); // Show max 10 labels
    data.forEach((item, index) => {
        if (index % xLabelStep === 0) {
            const x = scaleX(item[xKey]);
            
            // Add tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x);
            tick.setAttribute('y1', chartHeight);
            tick.setAttribute('x2', x);
            tick.setAttribute('y2', chartHeight + 5);
            tick.setAttribute('stroke', '#333');
            tick.setAttribute('stroke-width', '1');
            g.appendChild(tick);
            
            // Add label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', chartHeight + 15);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '10');
            label.textContent = item[xKey];
            g.appendChild(label);
        }
    });
    
    // Add Y-axis labels
    const yLabelStep = Math.ceil(maxY / 5); // Show about 5 labels
    for (let i = 0; i <= maxY; i += yLabelStep) {
        if (i > maxY) break;
        
        const y = scaleY(i);
        
        // Add tick mark
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', -5);
        tick.setAttribute('y1', y);
        tick.setAttribute('x2', 0);
        tick.setAttribute('y2', y);
        tick.setAttribute('stroke', '#333');
        tick.setAttribute('stroke-width', '1');
        g.appendChild(tick);
        
        // Add label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', -10);
        label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '10');
        label.textContent = i;
        g.appendChild(label);
    }
    
    // Create path for the line
    let pathData = '';
    data.forEach((item, index) => {
        const x = scaleX(item[xKey]);
        const y = scaleY(item[yKey]);
        
        if (index === 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#4285F4');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);
    
    // Add data points
    data.forEach(item => {
        const x = scaleX(item[xKey]);
        const y = scaleY(item[yKey]);
        
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', x);
        point.setAttribute('cy', y);
        point.setAttribute('r', 4);
        point.setAttribute('fill', '#4285F4');
        
        // Add tooltip data
        point.setAttribute('data-label', `${item[xKey]}`);
        point.setAttribute('data-value', item[yKey]);
        
        // Add tooltip behavior
        point.addEventListener('mouseenter', showTooltip);
        point.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(point);
    });
    
    svg.appendChild(g);
    container.appendChild(svg);
}

/**
 * Create a legend for a chart
 * @param {HTMLElement} container - The container element
 * @param {Array} data - The data array
 * @param {string} labelKey - The key for item labels
 * @param {string} percentageKey - The key for percentage values (optional)
 */
function createChartLegend(container, data, labelKey, percentageKey) {
    // Colors for the legend items (should match chart colors)
    const colors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
        '#5E35B1', '#D81B60', '#00ACC1', '#FB8C00',
        '#43A047', '#F44336', '#9C27B0', '#2196F3'
    ];
    
    // Create legend container
    const legend = document.createElement('div');
    legend.className = 'stats-chart-legend';
    
    // Create legend items
    data.forEach((item, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('span');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = colors[index % colors.length];
        
        const label = document.createElement('span');
        label.className = 'legend-label';
        
        // Show percentage if available
        if (percentageKey) {
            label.textContent = `${item[labelKey]} (${item[percentageKey]}%)`;
        } else {
            label.textContent = item[labelKey];
        }
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    container.appendChild(legend);
}

/**
 * Show tooltip on chart element hover
 * @param {Event} event - The mouse event
 */
function showTooltip(event) {
    // Remove any existing tooltips
    hideTooltip();
    
    const element = event.target;
    const label = element.getAttribute('data-label');
    const value = element.getAttribute('data-value');
    const percentage = element.getAttribute('data-percentage');
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'stats-chart-tooltip';
    tooltip.id = 'stats-tooltip';
    
    // Set tooltip content
    if (percentage) {
        tooltip.innerHTML = `<strong>${label}</strong>: ${value} (${percentage}%)`;
    } else {
        tooltip.innerHTML = `<strong>${label}</strong>: ${value}`;
    }
    
    // Position tooltip near the mouse
    const rect = element.getBoundingClientRect();
    const modal = document.querySelector('.stats-modal-content');
    const modalRect = modal.getBoundingClientRect();
    
    const tooltipX = rect.left + (rect.width / 2) - modalRect.left;
    const tooltipY = rect.top - 30 - modalRect.top;
    
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
    
    // Add to modal content
    modal.appendChild(tooltip);
}

/**
 * Hide tooltip on mouse leave
 */
function hideTooltip() {
    const tooltip = document.getElementById('stats-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * Export the current stats view as an image
 */
function exportStatsAsImage() {
    // Get the current active tab content
    const activeTab = document.querySelector('.stats-tab-pane.active');
    if (!activeTab) return;
    
    // Create a message to inform user about browser download
    const message = document.createElement('div');
    message.className = 'stats-export-message';
    message.textContent = 'Your browser will download the image shortly...';
    
    const modalContent = document.querySelector('.stats-modal-content');
    modalContent.appendChild(message);
    
    // Remove the message after a few seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
    
    // Use html2canvas or similar library to capture the content
    // This is a simplified version without the actual image conversion
    // In a real implementation, you would use html2canvas or a similar library
    
    alert('Image export functionality would be implemented here with html2canvas or a similar library.');
}

// Initialize the stats UI when the script loads
document.addEventListener('DOMContentLoaded', function() {
    // Use setTimeout to ensure this runs after other initialization
    setTimeout(function() {
        if (!statsUIInitialized) {
            console.log('Auto-initializing Stats UI on DOMContentLoaded');
            if (typeof initStatsUI === 'function') {
                initStatsUI();
            }
        }
    }, 200);
});

// Export to global scope - ONLY ONCE
window.VinylStatsUI = {
    showStatsModal,
    hideStatsModal,
    initStatsUI
};

// Make the function available globally for direct calls
window.initStatsUI = initStatsUI;
