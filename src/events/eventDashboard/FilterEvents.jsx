import React, { useState } from "react";
import Calendar from "react-calendar";
import { useSelector } from "react-redux";
import { Checkbox, Dropdown, Icon } from "semantic-ui-react";
import Messages from "../../features/messages/Messages";

export default function FilterEvents({ setPredicate, predicate, loading }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { authenticated } = useSelector((state) => state.auth);

  const handleDropdownClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <>
      <Dropdown
        pointing='top right'
        closeOnEscape
        icon={
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              marginBottom: "10px",
            }}
            onClick={handleDropdownClick}
          >
            <Icon
              name='filter'
              size='large'
              style={{
                padding: 0,
              }}
            />
          </button>
        }
        open={dropdownOpen}
      >
        <Dropdown.Menu>
          {authenticated && (
            <>
              <Dropdown.Item>
                <Checkbox
                  label='All Events'
                  checked={predicate.get("filter") === "all"}
                  onClick={() => setPredicate("filter", "all")}
                  disabled={loading}
                />
              </Dropdown.Item>
              <Dropdown.Item>
                <Checkbox
                  label="I'm Going"
                  checked={predicate.get("filter") === "isGoing"}
                  onClick={() => setPredicate("filter", "isGoing")}
                  disabled={loading}
                />
              </Dropdown.Item>
              <Dropdown.Item>
                <Checkbox
                  label="I'm Hosting"
                  checked={predicate.get("filter") === "isHost"}
                  onClick={() => setPredicate("filter", "isHost")}
                  disabled={loading}
                />
              </Dropdown.Item>
            </>
          )}
          <Dropdown.Divider />
          <Dropdown.Header
            icon='calendar'
            color='orange'
            content='Select Date'
          />
          <Calendar
            onChange={(date) => setPredicate("startDate", date)}
            value={predicate.get("startDate") || new Date()}
            tileDisabled={() => loading}
          />
        </Dropdown.Menu>
      </Dropdown>
      {authenticated && <Messages />}
    </>
  );
}
