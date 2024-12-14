import { DatabaseConfig } from "./types/databaseTypes";

export const databaseConfig: DatabaseConfig = {
  tables: [
    {
      name: "Counterparty",
      description:
        "Accounts of platforms users can sign up with. Bindle users might have Facebook or Email accounts.",
      position: { x: -240, y: -192 },
      columns: [
        {
          name: "id",
          description: "Unique identifier of an account.",
          key: true,
          type: "integer",
        },
        {
          name: "user_id",
          description: "User’s id.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "platform",
          description:
            "Account’s platform. Bindle allows email and facebook signups.",
          type: "text",
        },
        {
          name: "email",
          description:
            "Email attached to the account. Note that different platforms could have different emails.",
          type: "text",
        },
        {
          name: "created_at",
          description:
            "Timestamp when this account was created. created_at of the first account is user’s signup timestamp.",
          type: "datetime",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      schema: "adjust",
      name: "Counterparty_relationship",
      position: { x: 864, y: -192 },
      description:
        "Adjust is a mobile attribution service, sort of Google Analytics for the mobile world. Adjust sends back callbacks with information (attribution) about every mobile install, like where this install comes from, which link a person clicked before installing the app.",
      columns: [
        {
          name: "id",
          description: "Unique ID of an Adjust callback.",
          type: "integer",
          key: true,
        },
        {
          name: "tracker",
          description:
            "Adjust’s tracker parameter. For example https://app.adjust.com/gxel3d1.",
          type: "text",
        },
        {
          name: "created_at",
          description: "Timestamp of a callback.",
          type: "datetime",
        },
        {
          name: "campaign_name",
          description: "The value of campaign paramenter in Adjust URL.",
          type: "text",
        },
        {
          name: "adgroup_name",
          description: "The value of adgroup paramenter in Adjust URL.",
          type: "text",
        },
        {
          name: "creative_name",
          description: "The value of creative paramenter in Adjust URL.",
          type: "text",
        },
        {
          name: "label",
          description: "The value of label paramenter in Adjust URL.",
          type: "text",
        },
        {
          name: "device_name",
          description: "Model and OS version of a user’s device.",
          type: "text",
        },
        {
          name: "app_version",
          description: "Bindle’s app version at the moment.",
          type: "text",
        },
        {
          name: "activity_kind",
          description:
            "Predefined Adjust event, could be click, install, event (means custom event and event_name will be present) or else.",
          type: "text",
        },
        {
          name: "event_name",
          description: "Custom Adjust event; Bindle has custom signup event.",
          type: "text",
        },
        {
          name: "adid",
          description: "Adjust’s device ID.",
          type: "text",
        },
        {
          name: "user_id",
          description:
            "ID of a user (from users table). Present for signup event.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "country",
          description: "Country derived from user’s IP address.",
          type: "text",
        },
      ],
      schemaColor: "#AFA2FF",
    },
    {
      name: "Entity",
      description:
        "A join table for many-to-many relationship between users and books.",
      position: { x: -208, y: 224 },
      columns: [
        {
          name: "book_id",
          key: true,
          description: "Book’s id.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "user_id",
          key: true,
          description: "User’s id.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "last_page",
          description: "A number of the last page a user read in the book.",
          type: "integer",
        },
        {
          name: "created_at",
          description: "When the user started reading the book.",
          type: "datetime",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      name: "Instrument",
      description: "All books available in the Bindles library.",
      position: { x: -432, y: 320 },
      columns: [
        {
          name: "id",
          description: "Unique identifier of the book.",
          key: true,
          type: "integer",
          handleType: "source",
        },
        {
          name: "name",
          description: "Name of the book.",
          type: "text",
        },
        {
          name: "slug",
          description:
            "Identifer of a book used in URLs. For example https://www.bindle.com/books/final-future. Usually generated from book’s name.",
          type: "text",
        },
        {
          name: "genre",
          description: "Book’s genre.",
          type: "text",
        },
        {
          name: "pages_count",
          description: "Number of pages in the book.",
          type: "integer",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      name: "Protection",
      description:
        "This table keeps track of all devices users log in to Bindle with – browsers or mobile apps.",
      position: { x: -48, y: -336 },
      columns: [
        {
          name: "id",
          description: "Unique identifier of a user’s device.",
          key: true,
          type: "integer",
        },
        {
          name: "user_id",
          description: "id of a user who uses this device.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "device_type",
          description:
            "Type of the device, could be **browser** (for users who are using Bindle website) or **iphone** (users who are reading via Bindle app).",
          type: "text",
        },
        {
          name: "connected_at",
          description:
            "Timestamp when a user started using this device. Device with the earliest **connected_at** field is the device which user used for signing up.",
          type: "datetime",
        },
        {
          name: "version",
          description:
            "For browser devices it’s a User Agent. For iPhone devices it’s a version of user’s iPhone and a version of iOS separated by comma.",
          type: "text",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      schema: "helpers",
      name: "dates",
      description:
        "A helper table with consecutive dates. Might be useful to join sparse timelines to for reporting metrics per day.",
      position: { x: 512, y: 528 },
      columns: [
        {
          name: "id",
          description:
            "Unique identifier of a date. Just a primary key, an index of the table.",
          key: true,
          type: "integer",
        },
        {
          name: "date",
          description:
            "A date. By joining the very sparse timeline data to the consecutive range of dates we won’t have gaps.",
          type: "date",
        },
      ],
      schemaColor: "#75C9C8",
    },
    {
      name: "marketing_spends",
      description:
        "A table that keeps track of Bindles marketing investments per campaign, per day.",
      position: { x: 672, y: 528 },
      columns: [
        {
          name: "id",
          description:
            "Unique identifier of spend, just a primary key in a table.",
          key: true,
          type: "integer",
        },
        {
          name: "spent_at",
          description:
            "The date of a spend. Spend data is usually reported by date.",
          type: "date",
        },
        {
          name: "amount",
          description: "Amount of money in USD.",
          type: "integer",
        },
        {
          name: "clicks",
          description: "Number of clicks on the ad on this date.",
          type: "integer",
        },
        {
          name: "utm_source",
          description: "utm_source of marketing campaign.",
          type: "text",
        },
        {
          name: "utm_campaign",
          description: "utm_campaign of marketing campaign.",
          type: "text",
        },
        {
          name: "utm_term",
          description: "utm_term of marketing campaign.",
          type: "text",
        },
        {
          name: "utm_content",
          description: "utm_content of marketing campaign.",
          type: "text",
        },
        {
          name: "utm_medium",
          description: "utm_medium of marketing campaign.",
          type: "text",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      schema: "mobile_analytics",
      name: "events",
      description:
        "This analytics table contains all events fired by Bindle's mobile app.",
      position: { x: 656, y: -336 },
      columns: [
        {
          name: "event_id",
          description: "Unique identifier of an event.",
          type: "text",
          key: true,
        },
        {
          name: "category",
          description:
            "Category parameter of an event, for example onboarding.",
          type: "text",
        },
        {
          name: "action",
          description: "Action parameter of an event, for example screenview.",
          type: "text",
        },
        {
          name: "name",
          description:
            "Name parameter of an event, for example bindle-content.",
          type: "text",
        },
        {
          name: "screen_resolution",
          description:
            "Resolution of a user’s smartphone, for example 375x812.",
          type: "text",
        },
        {
          name: "device_type",
          description:
            "Model of a a user’s smartphone and the version of the OS, for example iPhone 7,12.1.0.",
          type: "text",
        },
        {
          name: "user_id",
          description:
            "If user is logged in – ID of a user in the users table.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "adid",
          description:
            "Unique identifier of a user’s smartphone, same as in Adjust callbacks table.",
          type: "text",
        },
        {
          name: "country",
          description: "Country derived from user’s IP address.",
          type: "text",
        },
        {
          name: "custom_parameters",
          description:
            "All custom parameters of an even in a key-value format.",
          type: "JSON",
        },
        {
          name: "created_at",
          description: "Timestamp of an event.",
          type: "datetime",
        },
        {
          name: "app_version",
          description:
            "Version of the Bindle app a user is using, for example 1.1.1.",
          type: "text",
        },
      ],
      schemaColor: "#FFD791",
    },
    {
      name: "products",
      description:
        "The list of all purchasable Bindle products (subscriptions).",
      position: { x: 704, y: 304 },
      columns: [
        {
          name: "id",
          description: "Unique identifier of a product.",
          key: true,
          type: "integer",
          handleType: "source",
        },
        {
          name: "name",
          description: "Name of a product.",
          type: "text",
        },
        {
          name: "price",
          description: "Price of a product",
          type: "float",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      name: "profiles",
      description:
        "To avoid growing the users table further, users' profile information was extracted to this table.",
      position: { x: -384, y: -16 },
      columns: [
        {
          name: "id",
          key: true,
          type: "number",
          description: "Unique identifier of a profile.",
        },
        {
          name: "user_id",
          type: "number",
          description: "User’s id.",
          handleType: "target",
        },
        {
          name: "about",
          type: "text",
          description: "Information about a user.",
        },
        {
          name: "interests",
          type: "text",
          description: "User’s interests. Comma separated list of tags.",
        },
        {
          name: "avatar_url",
          type: "text",
          description:
            "URL of an avatar user uploaded. Check some of them out ;)",
        },
        {
          name: "postal_code",
          type: "text",
          description: "A postal code of a user for books delivery.",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      name: "purchases",
      description: "This table contains all purchase transactions.",
      position: { x: 432, y: 192 },
      columns: [
        {
          name: "id",
          description: "Unique identifier of purchase.",
          type: "integer",
          key: true,
        },
        {
          name: "user_id",
          description: "id of a user who made the purchase.",
          type: "integer",
        },
        {
          name: "product_id",
          description: "id of a product inside products table.",
          type: "integer",
          handleType: "target",
        },
        {
          name: "amount",
          description:
            "How much money user paid. The number might vary since users could apply discounts. Amount is always in US dollars.",
          type: "float",
        },
        {
          name: "refunded",
          description:
            "bdl test;Status of a purchase, we receive money on the bank account only if purchase wasn’t refunded.",
          type: "boolean",
          handleType: "target",
        },
        {
          name: "created_at",
          description: "When purchase was made.",
          type: "datetime",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      name: "users",
      description: "This table contains all user records of Bindle.",
      position: { x: 192, y: -96 },
      columns: [
        {
          name: "id",
          key: true,
          description: "Unique identifier of a user.",
          type: "number",
          handleType: "source",
        },
        {
          name: "email",
          type: "text",
          description: "User’s email, unique.",
        },
        {
          name: "first_name",
          type: "text",
          description: "User’s first name.",
        },
        {
          name: "last_name",
          type: "text",
          description: "User’s last name.",
        },
        {
          name: "country",
          type: "text",
          description: "User’s signup country.",
        },
        {
          name: "signup_date",
          type: "date",
          description: "Date when user signed up.",
        },
        {
          name: "created_at",
          type: "datetime",
          description:
            "Timestamp when user record was created, we can treat it as signup date and time.",
        },
        {
          name: "status",
          type: "text",
          description:
            "What status user has in Bindle, could be free (can read only free books) or customer (user who purchased a subscription, can read all books).",
        },
        {
          name: "age",
          type: "integer",
          description: "User’s age.",
        },
        {
          name: "referrer_id",
          type: "integer",
          description:
            "id of another user who referred this user (this is usually set when users sign up via referral link).",
          handleType: "target",
        },
        {
          name: "visitor_id",
          type: "text",
          description:
            "Identifier of a user in the web_analytics.pageviews table. Generated by a web analytics system and stored in a cookie.",
          handleType: "source",
        },
        {
          name: "utm_source",
          type: "text",
          description:
            "utm_source in URL when user signed up, used for marketing attribution",
        },
        {
          name: "utm_campaign",
          type: "text",
          description:
            "utm_campaign in URL when user signed up, used for marketing attribution",
        },
        {
          name: "utm_term",
          type: "text",
          description:
            "utm_term in URL when user signed up, used for marketing attribution",
        },
        {
          name: "utm_content",
          type: "text",
          description:
            "utm_content in URL when user signed up, used for marketing attribution",
        },
        {
          name: "utm_medium",
          type: "text",
          description:
            "utm_medium in URL when user signed up, used for marketing attribution",
        },
        {
          name: "adjust_tracker",
          type: "text",
          description:
            "Adjust tracker in case user signed up via an Adjust link https://app.adjust.com/gxel3d1.",
        },
        {
          name: "adjust_campaign",
          type: "text",
          description: "The value of campaign paramenter in Adjust URL.",
        },
        {
          name: "adjust_adgroup",
          type: "text",
          description: "The value of adgroup paramenter in Adjust URL.",
        },
        {
          name: "adjust_creative",
          type: "text",
          description: "The value of creative paramenter in Adjust URL.",
        },
      ],
      schemaColor: "#91C4F2",
    },
    {
      schema: "web_analytics",
      name: "events",
      description:
        "This table contains all events that happen on Bindles website pages.Events are tracked during a pageview, that's why there's a has - many relation between pageviews and events.",
      position: { x: -368, y: 624 },
      columns: [
        {
          name: "pageview_id",
          description: "Category parameter of an event, for example Signup.",
          type: "text",
          handleType: "target",
        },
        {
          name: "category",
          description: "Action parameter of an event, for example Click.",
          type: "text",
        },
        {
          name: "action",
          description:
            "Name parameter of an event, for example Signup for free.",
          type: "text",
        },
        {
          name: "name",
          description:
            "Unique identifier of a record inside pageviews table. All events happen within one pageview.⚠️",
          type: "text",
        },
        {
          name: "created_at",
          description: "Timestamp of an event.",
          type: "datetime",
        },
      ],
      schemaColor: "yellow",
    },
    {
      schema: "web_analytics",
      name: "pageviews",
      description: "This table contains all pageviews of Bindle's website.",
      position: { x: -96, y: 544 },
      columns: [
        {
          name: "pageview_id",
          description: "Unique identifier of a pageview.",
          type: "text",
          key: true,
          handleType: "source",
        },
        {
          name: "visitor_id",
          description:
            "Unique identifier of a visitor. A fingerprint used to keep track of guest visitors who haven’t had signed up.",
          type: "text",
          handleType: "target",
        },
        {
          name: "user_id",
          description: "If user is logged in – ID of a user in users table.",
          type: "integer",
        },
        {
          name: "url",
          description: "URL of the visited page.",
          type: "text",
        },
        {
          name: "referer_url",
          description:
            "URL of the previous page where user clicked on a link with URL.",
          type: "text",
        },
        {
          name: "screen_resolution",
          description:
            "Screen resolution of a user’s device. Example: 1024x1366.",
          type: "text",
        },
        {
          name: "device_type",
          description:
            "Type of a user’s device. Could be mobile, tablet or desktop.",
          type: "text",
        },
        {
          name: "custom_parameters",
          description:
            "All custom parameters of a pageview in a key-value format. Could be added per page, for example we might add ab_test_variation key to keep track of what AB-test variation user had seen.",
          type: "JSON",
        },
        {
          name: "created_at",
          description: "Timestamp of a pageview.",
          type: "datetime",
        },
        {
          name: "country",
          description: "Country derived from user’s IP address.",
          type: "text",
        },
      ],
      schemaColor: "#F6BDD1",
    },
  ],
  edgeConfigs: [
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.purchases",
      targetKey: "refunded",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.books_users",
      targetKey: "user_id",
      relation: "hasMany",
    },
    {
      source: "public.products",
      sourceKey: "id",
      target: "public.purchases",
      targetKey: "product_id",
      relation: "hasMany",
    },
    {
      source: "public.books",
      sourceKey: "id",
      target: "public.books_users",
      targetKey: "book_id",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.profiles",
      targetKey: "user_id",
      relation: "hasOne",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.accounts",
      targetKey: "user_id",
      relation: "hasOne",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.devices",
      targetKey: "user_id",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "adjust.callbacks",
      targetKey: "user_id",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "visitor_id",
      target: "web_analytics.pageviews",
      targetKey: "visitor_id",
      relation: "hasMany",
    },
    {
      source: "web_analytics.pageviews",
      sourceKey: "pageview_id",
      target: "web_analytics.events",
      targetKey: "pageview_id",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "mobile_analytics.events",
      targetKey: "user_id",
      relation: "hasMany",
    },
    {
      source: "public.users",
      sourceKey: "id",
      target: "public.users",
      targetKey: "referrer_id",
      relation: "hasMany",
      sourcePosition: "left",
      targetPosition: "left",
    },
    {
      source: "helpers.dates",
      sourceKey: "id",
      target: "public.marketing_spends",
      targetKey: "id",
      relation: "hasMany",
    },
  ],
};
