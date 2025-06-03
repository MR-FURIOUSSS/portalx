# SRM Backend

A high-performance backend for scraping and serving SRMIST (SRM University) student data, including attendance, timetable, calendar, user info, and course details. Built with Node.js, Cheerio, and Axios.

## Features

- Fast, production-ready scraping of SRMIST student portal data
- Endpoints for attendance, timetable, calendar, user info, and courses
- Modular architecture: fetchers, parsers, handlers
- Robust error handling and data validation
- Easily extensible for new endpoints or data sources

## Project Structure

\`\`\`
backend/
├── src/
│   ├── fetch/      # Fetches raw HTML/data from SRMIST portal
│   ├── handler/    # API route handlers
│   ├── parser/     # Parses HTML/data into JSON
│   └── utils/      # Shared utilities (dynamic URLs, static data)
│   └── server.js   # Main server entry point
├── package.json
├── LICENSE
└── Readme.md
\`\`\`

## Setup

1. **Install dependencies:**
   \`\`\`sh
   npm install
   \`\`\`
2. **Run the server:**
   \`\`\`sh
   npm start
   \`\`\`
   Or for development with auto-reload:
   \`\`\`sh
   npm run dev
   \`\`\`

## API Endpoints

- `POST /attendance` — Get attendance data (requires SRMIST session cookie)
- `POST /timetable` — Get timetable for a batch (requires session cookie and batch)
- `POST /calendar` — Get academic calendar
- `POST /course` — Get course details
- `POST /userInfo` — Get user profile info

### Example Request

\`\`\`sh
curl -X POST http://localhost:3000/attendance \
  -H 'Content-Type: application/json' \
  -d '{"cookie": "SRMIST_SESSION_COOKIE_HERE"}'
\`\`\`

## Development Notes

- All HTML parsing is done with Cheerio for speed and reliability.
- Axios is used for HTTP requests to the SRMIST portal.
- All endpoints expect a valid session cookie for authentication.
- Parsers are separated from fetchers for testability and clarity.
- Error handling is robust; all errors return JSON with status codes.

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

## License

MIT
