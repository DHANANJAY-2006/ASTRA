@echo off
title PROJECT ASTRA - Darknet Threat De-Anonymization Workstation
echo ===================================================
echo   PROJECT ASTRA: Darknet Threat De-Anonymization
echo   Smart India Hackathon 2026 - Team BISHOP
echo ===================================================
echo.
echo Starting Interactive Analyst Web Workstation...
cd /d "%~dp0frontend"
start http://localhost:5173
npm run dev

