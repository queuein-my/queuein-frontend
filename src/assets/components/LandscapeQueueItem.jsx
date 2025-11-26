const LandscapeQueueItem = ({
  item,
  config,
  showPax,
  onCall,
  onSeat,
  onNoShow,
  getWaitingTimeClass,
  getCalledTimeClass,
  convertedTime,
  highlightedItem,
  landscapeHeaderClass,
}) => {
  const isHighlighted = item.id === highlightedItem;
  const baseClass = `${landscapeHeaderClass} text-center align-middle`;

  if (item.active === false) {
    const inactiveClass = item.quit
      ? "text-red-600/80 bg-stone-200 dark:bg-stone-800 dark:text-stone-400"
      : "bg-stone-200 dark:bg-stone-800 dark:text-stone-400";
    const statusText = item.quit
      ? `${config.customerSingularLabel} Quit`
      : `${item.called ? config.status.CALLED + " & " : ""}${
          item.seated ? config.status.SEATED : ""
        }${item.noShow ? config.status.NO_SHOW : ""}`;

    return (
      <div className="grid grid-cols-13 px-2 pb-1 text-xs font-light">
        <div
          className={`${baseClass} ${inactiveClass} col-span-1 rounded-l-xl`}
        >
          {item.position}
        </div>
        <div className={`${baseClass} ${inactiveClass} col-span-2`}>
          {convertedTime(item.createdAt)}
        </div>
        {showPax && (
          <div className={`${baseClass} ${inactiveClass} col-span-1`}>
            {item.pax}
          </div>
        )}
        <div className={`${baseClass} ${inactiveClass} col-span-3`}>
          {item?.customer?.name || item.name}
          {item?.customer?.VIP && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
              VIP
            </span>
          )}
        </div>
        <div className={`${baseClass} ${inactiveClass} col-span-2`}>
          {item.contactNumber || item?.customer?.number}
        </div>
        <div
          className={`${baseClass} ${inactiveClass} col-span-4 rounded-r-xl`}
        >
          {statusText}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-13 px-2 pb-1 dark:text-white text-center bg-white dark:bg-stone-700 font-semibold">
      <div className={`${baseClass} col-span-1 rounded-l-xl`}>
        {item.position}
      </div>
      <div
        className={`${baseClass} col-span-2 ${getWaitingTimeClass(
          item.createdAt
        )}`}
      >
        {convertedTime(item.createdAt)}
      </div>
      {showPax && (
        <div
          className={`${baseClass} col-span-1 ${
            isHighlighted ? "bg-yellow-200" : ""
          }`}
        >
          {item.pax}
        </div>
      )}
      <div className={`${baseClass} col-span-3`}>
        {item?.customer?.name || item?.name}
        {item?.customer?.VIP && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
            VIP
          </span>
        )}
      </div>
      <div className={`${baseClass} col-span-2`}>
        {item.contactNumber || item?.customer?.number}
      </div>
      <div className={`${baseClass} col-span-4 rounded-r-xl`}>
        <form className="flex justify-center items-center mt-1 gap-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`called-landscape-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onCall(e, item.id)}
              checked={item.called || false}
            />
            <label
              htmlFor={`called-landscape-${item.id}`}
              className={`ml-2 mr-2 text-xs ${getCalledTimeClass(
                item.calledAt
              )}`}
            >
              Called
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`seated-landscape-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onSeat(e, item.id)}
              checked={item.seated || false}
            />
            <label
              htmlFor={`seated-landscape-${item.id}`}
              className="text-xs ml-2"
            >
              {config.status.SEATED}
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`noShow-landscape-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onNoShow(e, item.id)}
              checked={item.noShow || false}
            />
            <label
              htmlFor={`noShow-landscape-${item.id}`}
              className="text-xs ml-2"
            >
              No Show
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandscapeQueueItem;
