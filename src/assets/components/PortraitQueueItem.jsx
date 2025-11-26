const PortraitQueueItem = ({
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
  activeTableHeader,
  activeTableAnswer,
}) => {
  const isHighlighted = item.id === highlightedItem;

  if (item.active === false) {
    const inactiveClass = item.quit
      ? "border-red-600/50 bg-stone-200 dark:bg-stone-800 dark:text-stone-400"
      : "border-stone-500 bg-stone-200 dark:bg-stone-800 dark:text-stone-400";
    const statusText = item.quit
      ? "Quit"
      : `${item.called ? config.status.CALLED + " & " : ""}${
          item.seated ? config.status.SEATED : ""
        }${item.noShow ? config.status.NO_SHOW : ""}`;

    return (
      <div
        className={`flex-row w-full my-3 rounded-2xl p-2 shadow-lg ${inactiveClass}`}
      >
        <div className="grid grid-cols-4">
          <div className="flex items-center p-1 col-span-1">
            <span
              className={`text-xs text-primary-dark-green dark:text-primary-light-green mr-2`}
            >
              Q #
            </span>
            <span className={activeTableAnswer}>{item.position}</span>
          </div>
          <div className="flex items-center p-1 col-span-1">
            <div className={`${activeTableAnswer} text-xs italic`}>
              {statusText}
            </div>
          </div>
          <div className="flex items-center p-1 relative col-span-2">
            <div className={activeTableHeader}>Name</div>
            <div className={activeTableAnswer}>
              <span className="z-1">
                {item?.customer?.name || item.name || "N/A"}
              </span>
              {item?.customer?.VIP && (
                <span className="ml-2 px-2 py-0.5 absolute -top-2 -right-2 md:top-0 md:right-0 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
                  VIP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-row w-full my-3 rounded-2xl p-2 shadow-2xl dark:shadow-white/20 border-stone-400 dark:border-stone-800 border-2">
      <div className="grid grid-cols-2 border-b-1">
        <div className="flex items-center p-1 border-r-1">
          <div className={`${activeTableHeader} md:mr-5`}>
            {config.customerSingularLabel} Number
          </div>
          <div className={`${activeTableAnswer} pr-2 md:pr-0`}>
            {item.position}
          </div>
        </div>
        <div className="flex items-center p-1 relative">
          <div
            className={`text-xs text-primary-dark-green dark:text-primary-light-green mr-3 ml-2`}
          >
            Name
          </div>
          <div className={activeTableAnswer}>
            <span className="z-1">
              {item.name || item?.customer?.name || "N/A"}
            </span>
            {item?.customer?.VIP && (
              <span className="ml-2 px-2 py-0.5 absolute -top-2 -right-2 md:top-0 md:right-0 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
                VIP
              </span>
            )}
          </div>
        </div>
      </div>
      {showPax && (
        <div className="grid grid-cols-3 border-b-1">
          <div className="col-span-1 flex items-center p-1 border-r-1">
            <div className={activeTableHeader}>PAX</div>
            <div
              className={`${activeTableAnswer} ${
                isHighlighted ? "bg-yellow-200 px-5" : ""
              }`}
            >
              {item.pax || "N/A"}
            </div>
          </div>
          <div className="col-span-2 flex items-center p-1 ">
            <div className={activeTableHeader}>
              <i className="fa-solid fa-clock"></i> Waited
            </div>
            <div
              className={`${activeTableAnswer} text-xs ${getWaitingTimeClass(
                item.createdAt
              )}`}
            >
              {convertedTime(item.createdAt)}
            </div>
          </div>
        </div>
      )}
      {!showPax && (
        <div className="flex items-center p-1 border-b-1">
          <div className={activeTableHeader}>
            <i className="fa-solid fa-clock"></i> Waited
          </div>
          <div
            className={`${activeTableAnswer} text-xs ${getWaitingTimeClass(
              item.createdAt
            )}`}
          >
            {convertedTime(item.createdAt)}
          </div>
        </div>
      )}
      <div className="flex items-center p-1 border-b-1">
        <div className={activeTableHeader}>
          <i className="fa-solid fa-phone"></i> {config.customerSingularLabel}
        </div>
        <div className={activeTableAnswer}>
          {item.contactNumber || item?.customer?.number || "N/A"}
        </div>
      </div>
      <form className="flex items-center mt-1">
        <div className={activeTableHeader}>Status</div>
        <div className="flex flex-wrap gap-1">
          <div className={`${activeTableAnswer} flex items-center md:ml-5`}>
            <input
              type="checkbox"
              id={`called-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onCall(e, item.id)}
              checked={item.called || false}
            />
            <label
              htmlFor={`called-${item.id}`}
              className={`${activeTableAnswer} ml-1 md:ml-2 md:mr-5 ${getCalledTimeClass(
                item.calledAt
              )}`}
            >
              Called
            </label>
          </div>
          <div className={`${activeTableAnswer} flex items-center pl-3`}>
            <input
              type="checkbox"
              id={`seated-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onSeat(e, item.id)}
              checked={item.seated || false}
            />
            <label
              htmlFor={`seated-${item.id}`}
              className={`${activeTableAnswer} ml-1 md:ml-2`}
            >
              {config.status.SEATED}
            </label>
          </div>
          <div className={`${activeTableAnswer} flex items-center md:ml-5`}>
            <input
              type="checkbox"
              id={`noShow-${item.id}`}
              className="h-5 w-5 cursor-pointer"
              onChange={(e) => onNoShow(e, item.id)}
              checked={item.noShow || false}
            />
            <label
              htmlFor={`noShow-${item.id}`}
              className={`${activeTableAnswer} ml-1 md:ml-2 md:mr-5`}
            >
              No Show
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PortraitQueueItem;
