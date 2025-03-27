console.log( 'Running Node locally...' );

import 'dotenv/config';

import {
    app,
    asyncHandler,
    ServerError
} from './dist/index.js';

app.get( "/hello", asyncHandler( async (req,res) => {
    res.json({hello:"world!"});
}));

app.get( "/error", asyncHandler( async (req,res) => {
    throw new ServerError([4],"You called error!");
}));

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.info(`Agentic Profile Express listening on http://localhost:${port}`);
});