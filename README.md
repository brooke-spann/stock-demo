# Stock Market Prediction Game

A real-time stock market prediction game that uses actual market data from Alpha Vantage API. Test your ability to predict whether stock prices will go up or down!

## 🎮 How to Play

1. Enter a valid stock ticker symbol (e.g., AAPL, MSFT, GOOGL, TSLA)
2. The game will randomly select a starting date from 1-100 days ago (weekdays only, excluding holidays)
3. View the stock price chart showing 7 days of historical data leading up to the start date
4. Predict whether the stock price will go UP or DOWN the next day
5. See if you're correct and watch your score increase!
6. Continue making predictions as new data points are revealed on the chart

## 🚀 Features

- **Real Stock Data**: Uses Alpha Vantage API for authentic market data
- **Interactive Charts**: Beautiful, responsive charts using Chart.js
- **Smart Date Selection**: Automatically selects valid trading days (no weekends/holidays)
- **Score Tracking**: Keep track of your prediction accuracy
- **Mobile Responsive**: Works great on all devices
- **Error Handling**: Validates stock symbols and provides helpful feedback

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **API**: Alpha Vantage Stock Market API
- **Deployment**: GitHub Pages
- **Styling**: Modern CSS with gradients and animations

## 📊 API Integration

This game uses the Alpha Vantage API to fetch real-time stock market data. The API provides:
- Daily time series data for any valid stock symbol
- Historical data going back several years
- Real closing prices for accurate predictions

## 🎯 Game Rules

- The starting date is randomly selected between 7-100 days ago
- Only weekdays (Monday-Friday) are selected as starting dates
- Major holidays are excluded from date selection
- Each correct prediction earns 1 point
- The game continues until you choose to end it or run out of data

## 📱 Mobile Support

The game is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- All modern web browsers

## 🚀 Getting Started

### For GitHub Pages Deployment:

1. Fork this repository
2. Go to your repository settings
3. Scroll down to "GitHub Pages"
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Your game will be available at `https://yourusername.github.io/stock-market-prediction-game`

### For Local Development:

1. Clone the repository
2. Open `index.html` in your web browser
3. Start playing!

No build process or dependencies required - it's a pure client-side application.

## 🔧 Configuration

The Alpha Vantage API key is already configured in the application. If you need to use your own API key:

1. Sign up for a free API key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Replace the `API_KEY` variable in `script.js` with your key

## 🎨 Customization

You can easily customize the game by modifying:
- **Colors**: Update the CSS color scheme in `index.html`
- **Chart Style**: Modify Chart.js configuration in `script.js`
- **Date Range**: Adjust the min/max days in the `generateRandomStartDate()` function
- **UI Elements**: Modify the HTML structure and CSS styles

## 📈 Future Enhancements

Potential features for future versions:
- Multiple difficulty levels
- Leaderboard system
- Social sharing of scores
- Additional technical indicators
- Portfolio simulation mode
- Historical accuracy statistics

## 🐛 Troubleshooting

**"Invalid stock symbol" error:**
- Make sure you're using a valid ticker symbol
- Try popular symbols like AAPL, MSFT, GOOGL first

**"API call frequency limit" error:**
- The free Alpha Vantage API has rate limits
- Wait a minute before trying again

**Chart not displaying:**
- Ensure you have a stable internet connection
- Check the browser console for any JavaScript errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🌟 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for providing the stock market API
- [Chart.js](https://www.chartjs.org/) for the beautiful charting library
- [Font Awesome](https://fontawesome.com/) for the icons

---

**Disclaimer**: This game is for educational and entertainment purposes only. It is not financial advice. Past performance does not indicate future results.