# SentiMind: Student Digital Well-being Predictor & Machine Learning Pipeline

SentiMind is an AI-powered predictive model designed to evaluate how daily social media interaction, demographic origins, and lifestyle choices correlate with student well-being scores. It leverages a robust preprocessing pipeline and ensemble-based regression tree architectures to calculate an objective balance metric out of 10.

---

## 1. Model Architecture & Pipeline

The predictive engine is built as an end-to-end scikit-learn `Pipeline` utilizing custom column transformers for localized preprocessing.

### Preprocessing Strategy (`ColumnTransformer`)
Features are divided into four logical pipelines to ensure maximum convergence and avoid leakage:
1.  **Skewed Numerical Features** (`Study_Hours`): Log-transformed using `np.log1p` to correct right-skewness and standardized using `StandardScaler`.
2.  **Plain Numerical Features** (`Age`, `Avg_Daily_Usage_Hours`, `Sleep_Hours_Per_Night`, `Physical_Activity_Hours`, `Daily_Unlocks`): Scaled using `StandardScaler` to uniform distributions.
3.  **Ordinal Categorical Features** (`Stress_Level`): Encoded using `OrdinalEncoder` matching the natural sequence hierarchy: `['Low', 'Medium', 'High', 'Very High']`.
4.  **Nominal Categorical Features** (`Gender`, `Most_Used_Platform`, `Grouped_country`, `Academic_Level`, `Purpose_Of_Use`): Encoded using `OneHotEncoder` with unknown values safely ignored (`handle_unknown='ignore'`).

---

## 2. Experimental Results & Performance Comparison

The regression models were validated using a 30% train-test split on student behavioral datasets. The Random Forest model significantly outperformed baseline Linear Regression.

| Regression Model | Test $R^2$ Score | Training $R^2$ Score | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) |
| :--- | :---: | :---: | :---: | :---: |
| **Linear Regression (Baseline)** | 0.739794 | 0.723677 | 0.536178 | 0.676032 |
| **Random Forest (Default)** | **0.877368** | 0.980761 | **0.347492** | **0.464099** |
| **Random Forest (Tuned)** | 0.865294 | 0.954729 | 0.368677 | 0.486409 |

*Note: While the default Random Forest model yielded slightly higher $R^2$ on the test set, hyperparameter tuning was applied to reduce training variance (overfitting) and optimize validation stability across randomized cross-validation folds.*

---

## 3. Hyperparameter Optimization

Hyperparameters were optimized using `RandomizedSearchCV` on the random forest ensemble.

**Optimal Configuration Found:**
*   `n_estimators`: `200`
*   `max_depth`: `15`
*   `min_samples_split`: `5`
*   `min_samples_leaf`: `2`
*   `random_state`: `42`

---

## 4. Evaluated Feature Dimensions (12 Key Inputs)

| Feature | Input Type | Scope / Validation Range | Description |
| :--- | :--- | :--- | :--- |
| **Age** | Numerical | 10 to 100 | Demographic baseline age. |
| **Gender** | Nominal | `Male`, `Female` | Self-reported gender identity. |
| **Country** | Nominal | Dynamic string | Residing location (mapped to top 10 countries or 'Other'). |
| **Academic Level** | Nominal | `High School`, `Undergrad`, `Graduate`, `Postgrad` | Current education level. |
| **Most Used Platform** | Nominal | 12 specific platforms (e.g. Instagram, YouTube) | Primary social media channel. |
| **Purpose of Use** | Nominal | `Networking`, `Education`, `Entertainment`, `News` | Core motivation behind social usage. |
| **Avg Daily Usage Hours**| Numerical | 0.0 to 24.0 | Time spent actively on social media. |
| **Daily Unlocks** | Numerical | $\ge 0$ | Total number of daily device unlocks. |
| **Study Hours** | Numerical | 0.0 to 24.0 | Daily academic hours. |
| **Sleep Hours** | Numerical | 0.0 to 24.0 | Sleep duration per night. |
| **Physical Activity** | Numerical | -1.0 to 24.0 | Active physical exercise hours. |
| **Stress Level** | Ordinal | `Low`, `Medium`, `High`, `Very High` | Perceived cognitive stress indicator. |

---

## 5. Deployment & API Endpoint

The model is serialized into a joblib binary (`mental_health_model.pkl`) and served via a FastAPI backend:
*   **Production Endpoint:** `https://mental-health-predictor-1-j81o.onrender.com/predict`
*   **Inference Payload:** `POST` request accepting JSON format inputs matching the schemas above, returning the predicted score out of 10 (`Predicted_Mental_Health_Score`).