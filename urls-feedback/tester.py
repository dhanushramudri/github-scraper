import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_all_urls(url):
    try:
        # Send a GET request to the URL
        response = requests.get(url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Parse the HTML content
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract all anchor tags (links)
            links = soup.find_all('a', href=True)

            # Extract and return the absolute URLs as a list
            total_urls = []
            for link in links:
                absolute_url = urljoin(url, link['href'])
                total_urls.append(absolute_url)

            return total_urls

        else:
            print(f"Failed to fetch HTML. Status code: {response.status_code}")

    except Exception as e:
        print(f"Error: {e}")

# Replace the URL with the one you want to scrape
url_to_scrape = "https://github.com/SimonHoiberg"
total_urls = get_all_urls(url_to_scrape)

# Print the total URLs
print(f"Total URLs: {len(total_urls)}")
for url in total_urls:
    print(url)
