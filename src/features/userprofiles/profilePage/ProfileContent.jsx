import React, { useState } from "react";
import { Tab } from "semantic-ui-react";
import About from "./About";
import UserPhotos from "./UserPhotos";
import EventsTab from "./EventsTab";
import FollowingTab from "./FollowingTab";

export default function ProfileContent({ profile, isCurrentUser }) {
  const [activeTab, setActiveTab] = useState(0);

  const panes = [
    {
      menuItem: "About",
      render: () => <About profile={profile} isCurrentUser={isCurrentUser} />,
    },
    {
      menuItem: "Photos",
      render: () => (
        <UserPhotos profile={profile} isCurrentUser={isCurrentUser} />
      ),
    },
    { menuItem: "Events", render: () => <EventsTab profile={profile} /> },
    {
      menuItem: "Followers",
      render: () => (
        <FollowingTab
          key={profile.id}
          profile={profile}
          activeTab={activeTab}
        />
      ),
    },
    {
      menuItem: "Following",
      render: () => (
        <FollowingTab
          key={profile.id}
          profile={profile}
          activeTab={activeTab}
        />
      ),
    },
  ];
  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='left'
      panes={panes}
      onTabChange={(e, data) => setActiveTab(data.activeIndex)}
    />
  );
}
