// stats.js - Core collection statistics functionality
// This module calculates statistics based on the vinyl collection data

/**
 * Calculate comprehensive statistics for a vinyl collection
 * @param {Array} albums - The array of album objects from the collection
 * @returns {Object} Object containing all calculated statistics
 */
function calculateCollectionStats(albums) {
    if (!albums || !albums.length) return null;
    
    const stats = {
        totalRecords: albums.length,
        genres: calculateGenreStats(albums),
        decades: calculateDecadeStats(albums),
        artists: calculateArtistStats(albums),
        sizes: calculateSizeStats(albums),
        favorites: calculateFavoriteStats(albums),
        recordTypes: calculateRecordTypeStats(albums),
        years: calculateYearRangeStats(albums),
        // More complex stats that need additional calculation
        listeningTime: estimateListeningTime(albums),
        colorAnalysis: analyzeAlbumArtColors(albums),
    };
    
    return stats;
}

/**
 * Calculate genre distribution statistics
 * @param {Array} albums - The array of album objects
 * @returns {Object} Genre statistics with counts and percentages
 */
function calculateGenreStats(albums) {
    const genreCounts = {};
    let totalWithGenre = 0;
    
    // Count occurrences of each genre
    albums.forEach(album => {
        if (album.genre) {
            // Handle comma-separated genres
            const genres = album.genre.split(/,|\//).map(g => g.trim());
            
            genres.forEach(genre => {
                if (genre) {
                    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                    totalWithGenre++;
                }
            });
        }
    });
    
    // Convert to array of objects for easier sorting and processing
    let genreStats = Object.keys(genreCounts).map(genre => ({
        name: genre,
        count: genreCounts[genre],
        percentage: (genreCounts[genre] / totalWithGenre * 100).toFixed(1)
    }));
    
    // Sort by count (descending)
    genreStats.sort((a, b) => b.count - a.count);
    
    return {
        distribution: genreStats,
        totalWithGenre: totalWithGenre,
        uniqueGenres: genreStats.length
    };
}

/**
 * Calculate decade distribution statistics
 * @param {Array} albums - The array of album objects
 * @returns {Object} Decade statistics with counts and percentages
 */
function calculateDecadeStats(albums) {
    const decadeCounts = {};
    let totalWithYear = 0;
    
    // Count occurrences of each decade
    albums.forEach(album => {
        if (album.year && !isNaN(parseInt(album.year))) {
            const year = parseInt(album.year);
            const decade = Math.floor(year / 10) * 10;
            decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
            totalWithYear++;
        }
    });
    
    // Convert to array of objects
    let decadeStats = Object.keys(decadeCounts).map(decade => ({
        decade: decade + 's',
        count: decadeCounts[decade],
        percentage: (decadeCounts[decade] / totalWithYear * 100).toFixed(1)
    }));
    
    // Sort by decade (ascending)
    decadeStats.sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
    
    return {
        distribution: decadeStats,
        totalWithYear: totalWithYear
    };
}

/**
 * Calculate artist statistics
 * @param {Array} albums - The array of album objects
 * @returns {Object} Artist statistics including most represented
 */
function calculateArtistStats(albums) {
    const artistCounts = {};
    
    // Count albums per artist
    albums.forEach(album => {
        if (album.artist) {
            artistCounts[album.artist] = (artistCounts[album.artist] || 0) + 1;
        }
    });
    
    // Convert to array of objects
    let artistStats = Object.keys(artistCounts).map(artist => ({
        name: artist,
        count: artistCounts[artist],
        percentage: (artistCounts[artist] / albums.length * 100).toFixed(1)
    }));
    
    // Sort by count (descending)
    artistStats.sort((a, b) => b.count - a.count);
    
    // Find potential complete discographies (artists with 3+ albums)
    const potentialCompleteDiscographies = artistStats
        .filter(artist => artist.count >= 3)
        .map(artist => artist.name);
    
    return {
        mostRepresented: artistStats.slice(0, 10), // Top 10 artists
        uniqueArtists: artistStats.length,
        potentialCompleteDiscographies: potentialCompleteDiscographies,
        artistDiversity: (artistStats.length / albums.length * 100).toFixed(1) // Higher means more diverse
    };
}

/**
 * Calculate vinyl size statistics (7", 10", 12")
 * @param {Array} albums - The array of album objects
 * @returns {Object} Size statistics with counts and percentages
 */
function calculateSizeStats(albums) {
    const sizeCounts = {
        '7"': 0,
        '10"': 0,
        '12"': 0,
        'Other': 0
    };
    let totalWithSize = 0;
    
    // Count occurrences of each size
    albums.forEach(album => {
        if (album.size) {
            const size = album.size.trim();
            if (sizeCounts[size] !== undefined) {
                sizeCounts[size]++;
            } else {
                sizeCounts['Other']++;
            }
            totalWithSize++;
        }
    });
    
    // Convert to array of objects
    let sizeStats = Object.keys(sizeCounts)
        .filter(size => sizeCounts[size] > 0) // Only include sizes that exist in collection
        .map(size => ({
            size: size,
            count: sizeCounts[size],
            percentage: totalWithSize ? (sizeCounts[size] / totalWithSize * 100).toFixed(1) : 0
        }));
    
    return {
        distribution: sizeStats,
        totalWithSize: totalWithSize
    };
}

/**
 * Calculate statistics about favorite albums
 * @param {Array} albums - The array of album objects
 * @returns {Object} Favorite statistics including genre breakdown
 */
function calculateFavoriteStats(albums) {
    const favorites = albums.filter(album => {
        if (!album.isfavorite) return false;
        
        const normalizedValue = String(album.isfavorite).trim().toLowerCase();
        return normalizedValue === 'yes' || normalizedValue === 'true';
    });
    
    // Get genre breakdown of favorites
    const favoriteGenres = {};
    favorites.forEach(album => {
        if (album.genre) {
            // Handle comma-separated genres
            const genres = album.genre.split(/,|\//).map(g => g.trim());
            
            genres.forEach(genre => {
                if (genre) {
                    favoriteGenres[genre] = (favoriteGenres[genre] || 0) + 1;
                }
            });
        }
    });
    
    // Convert to array and sort
    const favoriteGenreStats = Object.keys(favoriteGenres)
        .map(genre => ({
            name: genre,
            count: favoriteGenres[genre],
            percentage: favorites.length ? (favoriteGenres[genre] / favorites.length * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.count - a.count);
    
    return {
        count: favorites.length,
        percentage: (favorites.length / albums.length * 100).toFixed(1),
        genreBreakdown: favoriteGenreStats.slice(0, 5) // Top 5 genres among favorites
    };
}

/**
 * Calculate EP vs LP statistics
 * @param {Array} albums - The array of album objects
 * @returns {Object} Record type statistics
 */
function calculateRecordTypeStats(albums) {
    const eps = albums.filter(album => {
        if (!album.isep) return false;
        
        const normalizedValue = String(album.isep).trim().toLowerCase();
        return normalizedValue === 'yes' || normalizedValue === 'true';
    });
    
    const lps = albums.filter(album => {
        if (!album.isep) return true; // Default to LP if not specified
        
        const normalizedValue = String(album.isep).trim().toLowerCase();
        return normalizedValue !== 'yes' && normalizedValue !== 'true';
    });
    
    return {
        eps: {
            count: eps.length,
            percentage: (eps.length / albums.length * 100).toFixed(1)
        },
        lps: {
            count: lps.length,
            percentage: (lps.length / albums.length * 100).toFixed(1)
        }
    };
}

/**
 * Calculate year range statistics (oldest and newest records)
 * @param {Array} albums - The array of album objects
 * @returns {Object} Year range statistics
 */
function calculateYearRangeStats(albums) {
    const yearsArray = albums
        .map(album => album.year)
        .filter(year => year && !isNaN(parseInt(year)))
        .map(year => parseInt(year));
    
    if (yearsArray.length === 0) {
        return {
            oldest: null,
            newest: null,
            span: 0
        };
    }
    
    const oldest = Math.min(...yearsArray);
    const newest = Math.max(...yearsArray);
    
    // Group by year for year distribution
    const yearCounts = {};
    yearsArray.forEach(year => {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    // Convert to array and sort
    const yearDistribution = Object.keys(yearCounts)
        .map(year => ({
            year: parseInt(year),
            count: yearCounts[year]
        }))
        .sort((a, b) => a.year - b.year);
    
    return {
        oldest: oldest,
        newest: newest,
        span: newest - oldest + 1,
        distribution: yearDistribution
    };
}

/**
 * Estimate total listening time of the collection
 * This is an estimate as actual durations may not be available
 * @param {Array} albums - The array of album objects
 * @returns {Object} Estimated listening time in hours and minutes
 */
function estimateListeningTime(albums) {
    // Average album length estimates by type
    const averageMinutes = {
        lp: 40, // Average LP is around 40 minutes
        ep: 20, // Average EP is around 20 minutes
        single: 8  // Average 7" single is around 8 minutes
    };
    
    let totalMinutes = 0;
    
    albums.forEach(album => {
        // Determine album type - use size and isEP fields to guess
        let albumType = 'lp'; // Default to LP
        
        // Check if it's explicitly marked as an EP
        if (album.isep) {
            const normalizedValue = String(album.isep).trim().toLowerCase();
            if (normalizedValue === 'yes' || normalizedValue === 'true') {
                albumType = 'ep';
            }
        }
        
        // If it's a 7" and not explicitly an EP, it might be a single
        if (album.size && album.size.trim() === '7"') {
            // Only override if it's not explicitly marked as an EP
            if (albumType !== 'ep') {
                albumType = 'single';
            }
        }
        
        totalMinutes += averageMinutes[albumType];
    });
    
    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return {
        totalMinutes: totalMinutes,
        hours: hours,
        formattedTime: days > 0 
            ? `${days} days, ${remainingHours} hours, ${minutes} minutes`
            : `${hours} hours, ${minutes} minutes`,
        // For display purposes
        displayTime: {
            days: days,
            hours: remainingHours,
            minutes: minutes
        }
    };
}

/**
 * Analyze album art for color patterns (placeholder implementation)
 * Note: Actual implementation would require image processing library
 * @param {Array} albums - The array of album objects
 * @returns {Object} Color analysis results
 */
function analyzeAlbumArtColors(albums) {
    // This is a placeholder that would be replaced with actual image analysis
    // In a real implementation, we'd use an image processing library
    
    // Count how many albums have artwork
    const albumsWithArtwork = albums.filter(album => album.artwork && album.artwork.trim() !== '').length;
    
    return {
        albumsWithArtwork: albumsWithArtwork,
        coveragePercentage: (albumsWithArtwork / albums.length * 100).toFixed(1),
        // This would contain actual color analysis in a real implementation
        colorPalette: [
            // These would be the most common colors found across album covers
            '#e53935', // sample red
            '#8e24aa', // sample purple 
            '#1e88e5', // sample blue
            '#43a047', // sample green
            '#ffb300'  // sample yellow
        ]
    };
}

// Export the main function and any other utilities
window.VinylStats = {
    calculateCollectionStats,
    // Add any other utility functions you want to expose
};
