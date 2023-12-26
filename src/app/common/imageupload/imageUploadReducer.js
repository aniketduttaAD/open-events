export const UPLOAD_IMAGE = "UPLOAD_IMAGE";

export function uploadImage(payload) {
  return {
    type: UPLOAD_IMAGE,
    payload,
  };
}

const initialState = {
  image: null,
};

export default function imageReducer(state = initialState, action) {
  switch (action.type) {
    case UPLOAD_IMAGE:
      return {
        ...state,
        image: action.payload,
      };
    default:
      return state;
  }
}
