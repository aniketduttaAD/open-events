import React from "react";
import { useField } from "formik";
import {
  FormField,
  Label,
  List,
  ListDescription,
  ListHeader,
  ListItem,
  Segment,
} from "semantic-ui-react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

export default function MapsInput({ label, searchOptions, ...props }) {
  const [field, meta, helpers] = useField(props);

  function handleSelect(address) {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => helpers.setValue({ address, latLng }))
      .catch((error) => {
        if (error.message === "ZERO_RESULTS") {
          return;
        }
        helpers.setError(error);
      });
  }

  function handleBlur(e) {
    field.onBlur(e);
    if (!field.value.latLng) {
      helpers.setValue({ address: "", latLng: null });
    }
  }

  return (
    <PlacesAutocomplete
      value={field.value.address}
      onChange={(value) => helpers.setValue({ address: value })}
      onSelect={(value) => handleSelect(value)}
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <FormField error={meta.touched && !!meta.error}>
          <input
            {...getInputProps({
              name: field.name,
              onBlur: (e) => handleBlur(e),
              ...props,
            })}
          />
          {meta.touched && meta.error ? (
            <Label basic pointing color='red'>
              {meta.error.address}
            </Label>
          ) : null}
          {suggestions?.length > 0 && (
            <Segment
              loading={loading}
              style={{
                marginTop: 0,
                position: "absolute",
                zIndex: 1000,
                width: "100%",
              }}
            >
              <List selection>
                {suggestions.map((suggestion) => (
                  <ListItem
                    key={suggestion.placeId}
                    {...getSuggestionItemProps(suggestion)}
                  >
                    <ListHeader>
                      {suggestion.formattedSuggestion.mainText}
                    </ListHeader>
                    <ListDescription>
                      {suggestion.formattedSuggestion.secondaryText}
                    </ListDescription>
                  </ListItem>
                ))}
              </List>
            </Segment>
          )}
        </FormField>
      )}
    </PlacesAutocomplete>
  );
}
