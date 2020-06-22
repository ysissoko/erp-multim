export function getFormattedDate(rawDate)
{
  return new Date(rawDate).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'});
}

export function getTagByReceiptStatus(status)
  {
    switch(status)
    {
      case "todo":
        return "à réceptionner";
      case "inprogress":
        return "en cours";
      case "done":
        return "terminée";
    }

    return "undefined";
  }

  export function getTagByDeliveryStatus(status)
  {
    switch(status)
    {
      case "todo":
        return "à préparer";
      case "inprogress":
        return "en cours";
      case "done":
        return "terminée";
    }

    return "undefined";
  }

  export function getTagStatusColor(status)
  {
    switch(status)
    {
      case "à préparer":
        return "blue";
      case "en cours":
        return "orange";
      case "terminée":
        return "green";
      case "à réceptionner":
        return "blue";
      case "à scanner":
        return "blue";
      case "enregistré":
        return "green";
      case "done":
        return "green";
      case "inprogress":
        return "orange";
      case "todo":
        return "blue";       
    }

    return "gray";
  }