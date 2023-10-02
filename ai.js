
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAIApi } = require('openai');

const app = express();

// Replace with your OpenAI API key
const apiKey = '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';

// Initialize the OpenAI API client
const openai = new OpenAIApi({ key: apiKey });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


