require 'twitter'


#### Get your twitter keys & secrets:
#### https://dev.twitter.com/docs/auth/tokens-devtwittercom
twitter = Twitter::REST::Client.new do |config|
  config.consumer_key = 'I6gnJAEfeAXSUM1SgX6g9fa1f'
  config.consumer_secret = 'oU8GRirPaZpY1IPEXBHxAo1WAQ7IxBMoukINkBDaOLvvNif3TA'
  config.access_token = '100336165-EgOJskqXq3VJojRhZAzGRhFjKM8RNgN3ILqzSR3z'
  config.access_token_secret = 'r2EyV31hm0wUNypJ9WO1ZQi63MyVzDzgf7imoHfETBYgp'
end

search_term = URI::encode('#alexajacobshack')

SCHEDULER.every '2m', :first_in => 0 do |job|
  begin
    tweets = twitter.search("#{search_term}")

    if tweets
      tweets = tweets.map do |tweet|
        { name: tweet.user.name, body: tweet.text, avatar: tweet.user.profile_image_url_https }
      end
      send_event('twitter_mentions', comments: tweets)
    end
  rescue Twitter::Error
    puts "\e[33mFor the twitter widget to work, you need to put in your twitter API keys in the jobs/twitter.rb file.\e[0m"
  end
end
