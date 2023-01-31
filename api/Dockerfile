FROM python:3.10-slim-bullseye

# set working directory
WORKDIR /app

# copy the requirements file into the image
COPY ./requirements.txt /app/requirements.txt

# install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt
RUN pip install requests
RUN pip install pylint
RUN pip install openai
RUN pip install aiopyston

# copy every content from the local file to the image
COPY . /app

ENV FLASK_APP=app.py
ENV FLASK_DEBUG=1

EXPOSE 5000

# Start yarn dev server
CMD ["flask", "run", "-h", "0.0.0.0"]
