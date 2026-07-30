import joblib
from fastapi import FastAPI
import pandas as pd
from pydantic import BaseModel, Field 
from typing import Literal

model = joblib.load('mental_health_model.pkl')

app = FastAPI()

top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Turkey','Mexico','France']

#A first pydantic model
class StudentData(BaseModel):
    Age: int = Field(..., ge=10, le=100)
    Gender: Literal['Male', 'Female']
    Country: str
    Academic_Level: Literal['High School', 'Undergraduate', 'Graduate', 'Postgraduate']
    Most_Used_Platform: Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter','YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat']
    Purpose_Of_Use: Literal['Networking', 'Education', 'Entertainment', 'News']
    Avg_Daily_Usage_Hours: float = Field(..., ge=0.0, le=24.0)
    Daily_Unlocks: int = Field(..., ge=0)
    Study_Hours: float = Field(..., ge=0.0, le=24.0)
    Physical_Activity_Hours: float = Field(..., ge=-1.0, le=24.0)
    Sleep_Hours_Per_Night: float = Field(..., ge=0.0, le=24.0)
    Stress_Level: Literal['Medium', 'Low', 'Very High', 'High']
   

# Describe what we send back 
class PredictionResponse(BaseModel):
    Predicted_Mental_Health_Score: float



@app.get('/')
def greet():
    return {"message": "Welcome to the Mental Health Prediction API"}


@app.post('/predict', response_model=PredictionResponse)
def predict_mental_health(data: StudentData):
    country_group = data.Country if data.Country in top_countries else 'Other'
    input_row = pd.DataFrame([{
        'Study_Hours': data.Study_Hours,
        'Age': data.Age,
        'Avg_Daily_Usage_Hours': data.Avg_Daily_Usage_Hours,
        'Sleep_Hours_Per_Night': data.Sleep_Hours_Per_Night,
        'Physical_Activity_Hours': data.Physical_Activity_Hours,
        'Daily_Unlocks': data.Daily_Unlocks,
        'Stress_Level': data.Stress_Level,
        'Gender': data.Gender,
        'Most_Used_Platform': data.Most_Used_Platform,
        'Grouped_country': country_group,
        'Academic_Level': data.Academic_Level,
        'Purpose_Of_Use': data.Purpose_Of_Use,
    }])

    prediction = model.predict(input_row)[0]
    return PredictionResponse(Predicted_Mental_Health_Score=round(float(prediction), 2))