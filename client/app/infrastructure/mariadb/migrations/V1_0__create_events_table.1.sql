CREATE TABLE IF NOT EXISTS events (
    aggregateId       varchar(36) NOT NULL,
    aggregateType     varchar(100) NOT NULL,
    eventType         varchar(100) NOT NULL,
    eventDate         datetime NOT NULL,
    version           smallint UNSIGNED NOT NULL,
    data              text NOT NULL,
    sequence          int UNSIGNED NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (sequence),
    UNIQUE KEY (aggregateId, aggregateType, version),
    INDEX (aggregateId)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

