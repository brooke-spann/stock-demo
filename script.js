// Alpha Vantage API configuration
const API_KEY = 'FKC0SYM9CFSZO4G0';
const BASE_URL = 'https://www.alphavantage.co/query';

// Game state variables
let gameData = {
    symbol: '',
    stockData: {},
    currentDateIndex: 0,
    gameStartDate: null,
    score: 0,
    chart: null,
    chartDates: [],
    chartPrices: [],
    isGameActive: false,
    allDates: [],
    allPrices: []
};

// Utility functions
function showElement(id) {
    document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    showElement('errorMessage');
    hideElement('successMessage');
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    showElement('successMessage');
    hideElement('errorMessage');
}

function showLoading() {
    showElement('loading');
    hideElement('errorMessage');
    hideElement('successMessage');
}

function hideLoading() {
    hideElement('loading');
}

// Date utility functions
function isWeekday(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Sunday, 6 = Saturday
}

function isHoliday(date) {
    // Simple holiday check for major US market holidays
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // New Year's Day
    if (month === 1 && day === 1) return true;
    
    // Independence Day
    if (month === 7 && day === 4) return true;
    
    // Christmas Day
    if (month === 12 && day === 25) return true;
    
    // Thanksgiving (4th Thursday of November) - simplified check
    if (month === 11 && day >= 22 && day <= 28 && date.getDay() === 4) return true;
    
    return false;
}

function generateRandomStartDate() {
    const today = new Date();
    const minDaysAgo = 7;
    const maxDaysAgo = 100;
    
    let attempts = 0;
    let randomDate;
    
    do {
        const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
        randomDate = new Date(today);
        randomDate.setDate(today.getDate() - daysAgo);
        attempts++;
    } while ((!isWeekday(randomDate) || isHoliday(randomDate)) && attempts < 50);
    
    return randomDate;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
}

// Alpha Vantage API functions
async function fetchStockData(symbol) {
    try {
        const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error('Invalid stock symbol. Please try again with a valid ticker symbol.');
        }
        
        if (data['Note']) {
            throw new Error('API call frequency limit reached. Please try again in a minute.');
        }
        
        if (!data['Time Series (Daily)']) {
            throw new Error('Unable to fetch stock data. Please check the symbol and try again.');
        }
        
        return data['Time Series (Daily)'];
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

function processStockData(stockData, startDate) {
    const dates = [];
    const prices = [];
    
    // Convert to array and sort by date
    const sortedData = Object.entries(stockData)
        .map(([date, data]) => ({
            date: new Date(date),
            price: parseFloat(data['4. close'])
        }))
        .sort((a, b) => a.date - b.date);
    
    // Find the start date index
    const startDateString = formatDateForAPI(startDate);
    let startIndex = -1;
    
    for (let i = 0; i < sortedData.length; i++) {
        if (formatDateForAPI(sortedData[i].date) === startDateString) {
            startIndex = i;
            break;
        }
    }
    
    // If exact date not found, find the closest previous date
    if (startIndex === -1) {
        for (let i = sortedData.length - 1; i >= 0; i--) {
            if (sortedData[i].date <= startDate) {
                startIndex = i;
                break;
            }
        }
    }
    
    if (startIndex === -1 || startIndex < 7) {
        throw new Error('Not enough historical data for this date range.');
    }
    
    // Get 7 days before start date for initial chart
    for (let i = startIndex - 7; i < startIndex; i++) {
        dates.push(sortedData[i].date);
        prices.push(sortedData[i].price);
    }
    
    return {
        initialDates: dates,
        initialPrices: prices,
        allData: sortedData,
        startIndex: startIndex
    };
}

// Chart functions
function createChart(dates, prices) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (gameData.chart) {
        gameData.chart.destroy();
    }
    
    gameData.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: [{
                label: `${gameData.symbol} Stock Price`,
                data: prices,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${gameData.symbol} Stock Price History`
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateChart() {
    if (gameData.chart) {
        gameData.chart.data.labels = gameData.chartDates.map(date => formatDate(date));
        gameData.chart.data.datasets[0].data = gameData.chartPrices;
        gameData.chart.update('none'); // No animation for smoother updates
    }
}

// Game logic functions
async function startGame() {
    const symbolInput = document.getElementById('stockTicker');
    const symbol = symbolInput.value.trim().toUpperCase();
    
    if (!symbol) {
        showError('Please enter a stock ticker symbol.');
        return;
    }
    
    showLoading();
    
    try {
        // Generate random start date
        const startDate = generateRandomStartDate();
        
        // Fetch stock data
        const stockData = await fetchStockData(symbol);
        
        // Process the data
        const processedData = processStockData(stockData, startDate);
        
        // Update game state
        gameData.symbol = symbol;
        gameData.stockData = stockData;
        gameData.gameStartDate = startDate;
        gameData.currentDateIndex = processedData.startIndex;
        gameData.score = 0;
        gameData.chartDates = [...processedData.initialDates];
        gameData.chartPrices = [...processedData.initialPrices];
        gameData.allDates = processedData.allData.map(item => item.date);
        gameData.allPrices = processedData.allData.map(item => item.price);
        gameData.isGameActive = true;
        
        // Update UI
        hideLoading();
        updateGameInfo();
        createChart(gameData.chartDates, gameData.chartPrices);
        showElement('chartContainer');
        showElement('gameInfo');
        showElement('predictionSection');
        showElement('scoreDisplay');
        
        showSuccess(`Game started! Predict the next day's movement for ${symbol}.`);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function updateGameInfo() {
    document.getElementById('currentSymbol').textContent = gameData.symbol;
    
    // Current date should be the last date in the chart
    const currentDate = gameData.chartDates[gameData.chartDates.length - 1];
    document.getElementById('currentDate').textContent = formatDate(currentDate);
    
    // Current price should be the last price in the chart
    const currentPrice = gameData.chartPrices[gameData.chartPrices.length - 1];
    document.getElementById('currentPrice').textContent = '$' + currentPrice.toFixed(2);
    
    document.getElementById('score').textContent = gameData.score;
    document.getElementById('scoreValue').textContent = gameData.score;
}

function makePrediction(direction) {
    if (!gameData.isGameActive) return;
    
    // Check if we have a next day to reveal
    if (gameData.currentDateIndex >= gameData.allDates.length - 1) {
        showError('No more data available. Game over!');
        endGame();
        return;
    }
    
    // Get current and next day prices
    const currentPriceIndex = gameData.chartPrices.length - 1;
    const currentPrice = gameData.chartPrices[currentPriceIndex];
    
    // Get next day's data
    const nextDate = gameData.allDates[gameData.currentDateIndex];
    const nextPrice = gameData.allPrices[gameData.currentDateIndex];
    
    // Determine if prediction was correct
    const actualDirection = nextPrice > currentPrice ? 'up' : 'down';
    const isCorrect = direction === actualDirection;
    
    // Update score
    if (isCorrect) {
        gameData.score++;
    }
    
    // Add next day's data to chart
    gameData.chartDates.push(nextDate);
    gameData.chartPrices.push(nextPrice);
    gameData.currentDateIndex++;
    
    // Update chart and UI
    updateChart();
    updateGameInfo();
    
    // Show result
    const priceChange = ((nextPrice - currentPrice) / currentPrice * 100).toFixed(2);
    const changeDirection = nextPrice > currentPrice ? '↗️' : '↘️';
    
    if (isCorrect) {
        showSuccess(`Correct! ${changeDirection} Price moved ${Math.abs(priceChange)}% ${actualDirection}. Score: ${gameData.score}`);
    } else {
        showError(`Wrong! ${changeDirection} Price moved ${Math.abs(priceChange)}% ${actualDirection}. Score: ${gameData.score}`);
    }
}

function endGame() {
    gameData.isGameActive = false;
    hideElement('predictionSection');
    showSuccess(`Game ended! Final score: ${gameData.score} correct predictions.`);
    
    // Reset for new game
    setTimeout(() => {
        resetGame();
    }, 3000);
}

function resetGame() {
    // Reset all game state
    gameData = {
        symbol: '',
        stockData: {},
        currentDateIndex: 0,
        gameStartDate: null,
        score: 0,
        chart: null,
        chartDates: [],
        chartPrices: [],
        isGameActive: false,
        allDates: [],
        allPrices: []
    };
    
    // Reset UI
    document.getElementById('stockTicker').value = '';
    hideElement('chartContainer');
    hideElement('gameInfo');
    hideElement('predictionSection');
    hideElement('scoreDisplay');
    hideElement('errorMessage');
    hideElement('successMessage');
    
    // Destroy chart
    if (gameData.chart) {
        gameData.chart.destroy();
        gameData.chart = null;
    }
}

// Event listeners
document.getElementById('stockTicker').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        startGame();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Focus on input
    document.getElementById('stockTicker').focus();
});