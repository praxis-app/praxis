type FormDataValue = string | Blob | Blob[];

export const createFormData = (
  fields: Record<string, FormDataValue>,
): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([name, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(name, item));
    } else {
      formData.set(name, value);
    }
  });
  return formData;
};

export const getJsonOrFormData = (
  payload: unknown,
  files: Record<string, Blob | Blob[] | undefined>,
): unknown | FormData => {
  const presentFiles = Object.entries(files).filter(
    (entry): entry is [string, Blob | Blob[]] =>
      entry[1] !== undefined &&
      (!Array.isArray(entry[1]) || entry[1].length > 0),
  );

  if (presentFiles.length === 0) {
    return payload;
  }

  return createFormData({
    payload: JSON.stringify(payload),
    ...Object.fromEntries(presentFiles),
  });
};
