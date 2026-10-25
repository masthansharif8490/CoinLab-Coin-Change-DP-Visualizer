from django.shortcuts import render


def index(request):
    """Serve the Coin Change visualizer page. The DP runs in the browser."""
    return render(request, "coinlab/index.html")
