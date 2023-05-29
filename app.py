from flask import Flask, render_template, request, jsonify
from utils import fetch_data, calculate_sma, calculate_sma_intersections

# Routes
app = Flask(__name__)


@app.route('/data', methods=['GET'])
def data():
    asset = request.args.get('asset')
    window = int(request.args.get('window'))
    df = fetch_data(asset, 500)
    calculate_sma(df, window)
    data = df[['timestamp', 'close', 'sma_short',
               'sma_long']].to_dict(orient='records')

    return jsonify(data)


@app.route('/intersections', methods=['GET'])
def intersections():
    asset = request.args.get('asset')
    window = int(request.args.get('window'))
    df = fetch_data(asset, 500)
    calculate_sma(df, window)
    intersections = calculate_sma_intersections(df)
    return jsonify(intersections)


@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
