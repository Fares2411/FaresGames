In this milestone I worked on making a website for my project. The backend was implemented using fastapi and PyMySql libraries. The frontend used React. The website implements the requirements of the milestone each in separate pages. I deployed the database on aiven.io, the frontend of the website was deployed on Netlify and the backend was deployed on Render. The website is easy to use. Note that some pages takes few seconds to load that's not because the queries are not efficient but because the database, frontend, and backend were hosted on free tiers of the services which have limited resources and also they are on separate servers which adds latency to the requests. Also, some pages need to make multiple queries to the database to get the required data so it takes more time to load, but overall the website is responsive and easy to use and not slow to the point of being unusable, all the time taken to load the pages is reasonable and doens't exceed a few seconsds. Some features were added to the website to enhance the experience, for example all the dropdown menues have search functionality to make it easier to find the options, also all of them are dynamic -not hardcoded- so they always contain the latest data from the database. There are other interesting features. The website is mobile friendly and can be used on different screen sizes. The dream game has all the specs of the game. The website also has a navigation bar to make it easier to navigate between the pages. 
I deployed the website using the following link: https://thunderous-dasik-8f57c9.netlify.app/
Also, if you want to test the website locally you can do so by following these steps:
first, open the backend folder and install the required libraries using the command:
Activate virtual environment (if you have one)
Windows:
venv\Scripts\activate
Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
then run the backend server using the command:
uvicorn app.main:app --reload
after that, open the frontend folder and install the required libraries using the command:
npm install
then run the frontend server using the command:
npm run dev
finally, open your browser and go to the link:
http://localhost:5173/
to access the website, and to access the backend api documentation go to the link:
http://localhost:8000/docs
Make sure to update the database connection details in the backend/app/config.py file to match your database credentials.