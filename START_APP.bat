@echo off
title People's Priorities Civic Platform
echo ========================================================
echo Starting People's Priorities Platform...
echo ========================================================

start "" "http://localhost:8000"
py server.py

pause
