import React from 'react';
import axios from 'axios';
import { Container, Label } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';
import { useHistory } from 'react-router-dom';

function AddTrack() {
    const history = useHistory();
    const errorLabel = <Label color="red" pointing/>
    return (
        <Container textAlign="left">
            <h1>Add a track</h1>
            <Form onValidSubmit={handleSubmit}>
                <Form.Input
                    name="title"
                    label="Title"
                    errorLabel={errorLabel}
                    required />
                <Form.Input
                    name="artist"
                    label="Artist"
                    errorLabel={errorLabel}
                    required />

                <Form.Input
                    name="src"
                    label="Source"
                    errorLabel={errorLabel}
                    required />
                <Form.Input
                    name="license"
                    label="License url"
                    errorLabel={errorLabel}
                    required />
                <Form.Button content="Submit" color="green" />
            </Form>
        </Container>
    );

    function handleSubmit(formData: any) {
        axios.post("/api/v1/users/me/track", {
            src: formData.src,
            license: formData.license,
            title: formData.title,
            artist: formData.artist
        });

        history.push("/");
    }
}

export default AddTrack;