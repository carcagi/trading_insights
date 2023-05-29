import ccxt
import pandas as pd
import numpy as np
from datetime import datetime

def fetch_data(asset, limit):
    exchange = ccxt.binance()
    data = exchange.fetch_ohlcv(asset, timeframe='1d', limit=limit)
    df = pd.DataFrame(
        data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    return df


def calculate_sma(df, window):
    df['sma_short'] = df['close'].rolling(window=window).mean()
    df['sma_long'] = df['close'].rolling(window=window*2).mean()
    # Remove the NaN data points
    df.dropna(subset=['sma_short', 'sma_long'], inplace=True)


def calculate_sma_intersections(df):
    intersections = []
    sma_short = df['sma_short'].tolist()
    sma_long = df['sma_long'].tolist()

    for i in range(1, len(df)):
        if sma_short[i-1] < sma_long[i-1] and sma_short[i] > sma_long[i]:
            # Subtract 1 from the index
            intersections.append((i-1, sma_short[i], 'buy'))
        elif sma_short[i-1] > sma_long[i-1] and sma_short[i] < sma_long[i]:
            # Subtract 1 from the index
            intersections.append((i-1, sma_short[i], 'sell'))

    return intersections