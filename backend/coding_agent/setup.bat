@echo off
echo ================================
echo WizardLM Backend Setup
echo ================================

echo.
echo 1. Creating virtual environment...
python -m venv quiz_env

echo.
echo 2. Activating virtual environment...
call quiz_env\Scripts\activate

echo.
echo 3. Installing dependencies...
pip install -r requirements.txt

echo.
echo 4. Setup complete!
echo.
echo To run the server:
echo   quiz_env\Scripts\activate
echo   python main.py
echo.
echo The API will be available at: http://localhost:8000
echo API docs will be at: http://localhost:8000/docs
echo.
pause 