import React from "react";
import { useState } from "react";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import { format } from "date-fns";
import ProfileUpdate from "./ProfileUpdate";

export default function About({ profile, isCurrentUser }) {
  const [editMode, setEditMode] = useState(false);
  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header
            floated='left'
            icon='user'
            content={`About ${profile.displayName},`}
          />
          {isCurrentUser && (
            <Button
              onClick={() => setEditMode(!editMode)}
              floated='right'
              basic
              content={editMode ? "Cancel" : "Edit"}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {editMode ? (
            <ProfileUpdate profile={profile} setEditMode={setEditMode} />
          ) : (
            <>
              <div style={{ marginBottom: 10 }}>
                Member since :{" "}
                {format(new Date(profile.createdAt), "dd MMM yyyy")}
                <div>{profile.description || null}</div>
              </div>
            </>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
}
