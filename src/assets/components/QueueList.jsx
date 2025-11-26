import React from "react";
import PortraitQueueItem from "./PortraitQueueItem";
import LandscapeQueueItem from "./LandscapeQueueItem";

const QueueList = ({
  activeItems,
  inactiveItems,
  quitItems,
  isLandscape,
  config,
  primaryTextClass,
  horizontalHeaderClass,
  landscapeHeaderClass,
  activeTableHeader,
  activeTableAnswer,
  ...props // Pass down all other props like showPax, onCall, etc.
}) => {
  const ListSection = ({ title, items, ItemComponent }) => (
    <div>
      <p
        className={`text-sm ${primaryTextClass} font-semibold underline mt-5 mb-2`}
      >
        {title}
      </p>
      {items.map((item) => (
        <ItemComponent
          key={item.id}
          item={item}
          config={config}
          activeTableHeader={activeTableHeader}
          activeTableAnswer={activeTableAnswer}
          {...props}
        />
      ))}
    </div>
  );

  if (isLandscape) {
    return (
      <div className="hidden md:block overflow-auto">
        <div
          className={`grid grid-cols-13 mt-3 rounded-md p-2 shadow-lg dark:shadow-white/20 lg:shadow-none ${horizontalHeaderClass} text-center`}
        >
          <div className={`${landscapeHeaderClass} col-span-1 rounded-l-xl`}>
            Q#
          </div>
          <div className={`${landscapeHeaderClass} col-span-2`}>
            Time Waited
          </div>
          {props.showPax && (
            <div className={`${landscapeHeaderClass} col-span-1`}>PAX</div>
          )}
          <div className={`${landscapeHeaderClass} col-span-3`}>
            {config.customerLabel} Name
          </div>
          <div className={`${landscapeHeaderClass} col-span-2`}>
            {config.customerLabel} Contact Number
          </div>
          <div className={`${landscapeHeaderClass} col-span-4 rounded-r-xl`}>
            Status
          </div>
        </div>
        {activeItems.map((item) => (
          <LandscapeQueueItem
            key={item.id}
            item={item}
            config={config}
            landscapeHeaderClass={landscapeHeaderClass}
            {...props}
          />
        ))}
        {inactiveItems.map((item) => (
          <LandscapeQueueItem
            key={item.id}
            item={item}
            config={config}
            landscapeHeaderClass={landscapeHeaderClass}
            {...props}
          />
        ))}
        {quitItems.map((item) => (
          <LandscapeQueueItem
            key={item.id}
            item={item}
            config={config}
            landscapeHeaderClass={landscapeHeaderClass}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <ListSection
        title={`Active ${config.customerLabel}`}
        items={activeItems}
        ItemComponent={PortraitQueueItem}
      />
      <ListSection
        title={`Inactive ${config.customerLabel}`}
        items={inactiveItems}
        ItemComponent={PortraitQueueItem}
      />
      <ListSection
        title={`${config.customerLabel} Who Left`}
        items={quitItems}
        ItemComponent={PortraitQueueItem}
      />
    </div>
  );
};

export default QueueList;
