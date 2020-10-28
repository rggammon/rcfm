import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (<>
        <p>
            <Link to="addTrack">Add track</Link>
        </p>
        <p>
            <Link to="player">Player</Link>
        </p>
    </>);
}

export default Home;