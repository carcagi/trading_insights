from flask import Flask, render_template, request,jsonify
import ccxt
import pandas as pd
import numpy as np
from datetime import datetime

def fetch_data(asset, limit):
    exchange = ccxt.binance()
    data = exchange.fetch_ohlcv(asset, timeframe='1d', limit=limit)
    df = pd.DataFrame(data, columns=['timestamp', 'open', 'high', 'low','close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    return df

def calculate_sma(df, window):
    df['sma_short'] = df['close'].rolling(window=window).mean()
    df['sma_long'] = df['close'].rolling(window=window*2).mean()
    # Remove the NaN data points
    df.dropna(subset=['sma_short', 'sma_long'], inplace=True)

app = Flask(__name__)

@app.route('/data', methods=['GET'])
def data():
    asset = request.args.get('asset')
    window = int(request.args.get('window'))
    df = fetch_data(asset, 500)
    calculate_sma(df, window)
    return jsonify(df.to_dict(orient='records'))

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)