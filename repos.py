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

            # Extract and print the absolute URLs
            total_urls = 0
            for link in links:
                absolute_url = urljoin(url, link['href'])
                print(absolute_url)
                total_urls += 1

            # Print the total count of URLs
            print(f"Total URLs: {total_urls}")

        else:
            print(f"Failed to fetch HTML. Status code: {response.status_code}")

    except Exception as e:
        print(f"Error: {e}")

# Replace the URL with the one you want to scrape
url_to_scrape = "https://github.com/SimonHoiberg"
get_all_urls(url_to_scrape)

# model = genAI.getGenerativeModel({ model: "gemini-pro" });
# result = await model.generateContent(total_urls);
# response = await result.response;
# print(response)