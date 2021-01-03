import React from 'react';
import { Container } from 'semantic-ui-react';

function Home() {
    return (
        <Container textAlign="center">
            <blockquote className="twitter-tweet">
                <p lang="en" dir="ltr">
                    &quot;The Duck&#39;s Quack&quot;, recorded 1923 by Kaplan&#39;s Melodists in 1923 at Edison Laboratories. 
                    <a href="https://twitter.com/hashtag/squac?src=hash&amp;ref_src=twsrc%5Etfw">#squac</a>
                    <a href="https://t.co/aiEFzhh3MC">https://t.co/aiEFzhh3MC</a>
                </p>
                &mdash; Ryan Gammon (@rggammon) 
                <a href="https://twitter.com/rggammon/status/1344360359910547457?ref_src=twsrc%5Etfw">December 30, 2020</a>
            </blockquote> 
        </Container>
    );
}

export default Home;