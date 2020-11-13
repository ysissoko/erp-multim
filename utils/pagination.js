function getPaginatedData(page, displayLength, data)
{
    return data.filter((v, i) => {
      const start = displayLength * (page - 1);
      const end = start + displayLength;
      return i >= start && i < end;
    });
}

export {getPaginatedData};