- http://codeblog.dotsandbrackets.com/using-zeromq-with-docker/
- use .env files
- add consul
- add consul template
- add registrator
- add varnish
- add api to work with the webhooks from contentful to create products, catch data to be able to replay
- http://zguide.zeromq.org/js:taskwork
- http://www.codedependant.net/2014/09/13/pub-sub-with-zeromq/
- http://www.squaremobius.net/amqp.node/
- https://github.com/postwait/node-amqp#connection-options-and-url
- http://www.webdevelopersdiary.com/blog/good-to-know-how-to-properly-store-date-and-time-values-in-mysql
- http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/


Should I use push or pull when publishing my events?

Push has the advantage that events can be pushed as they happen. Pull has the advantage that read sides can be more active and independent. Pull with a local event cache on the read side seems to us to be the nicest and most scalable solution. Push can work nicely with reactive programming and web sockets, however. Again, you needn't make the same choice everywhere in a system.

What if we trigger an event over a scheduled period to pull? an event that will only have 1 listener.
Or we can implement at the moment of a read an event to update the readmodel if readmodel is out of sync for x minutes / events

Distributed events can be used by external systems, like process managers / sagas. Or any other bounded context

- https://groups.google.com/forum/#!topic/dddcqrs/S_c_eqQElh8/discussion
- https://blog.oasisdigital.com/2015/event-sourced-cqrs-read-model/
- https://blog.yld.io/2016/10/24/node-js-databases-an-embedded-database-using-leveldb/