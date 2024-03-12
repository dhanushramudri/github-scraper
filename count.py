import requests
from bs4 import BeautifulSoup

url = 'https://github.com/dhanushramudri'

totaldata = {}

reposCount = 'reposCount'



response = requests.get(url)

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the <span> element with class="Counter"
    counter_span = soup.find('span', class_='Counter')

    if counter_span:
        count = counter_span.text
        totaldata[reposCount] = count
        print(f'The count is: {count}')
        print(totaldata)
        
    else:
        print('Unable to find the specified <span> element.')
else:
    print(f'Failed to fetch the page. Status code: {response.status_code}')

