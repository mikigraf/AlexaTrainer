require 'dashing'
require "json"

$pushUps = 0

post "/test" do
  $data = request.body.read
  puts "Data is: #{$data}"
  $date = JSON.parse($data)["date"]
  puts "Date is: #{$date}"
  $pushUps = JSON.parse($data)["pushUps"]
end


configure do
  set :auth_token, 'YOUR_AUTH_TOKEN'

  helpers do
    def protected!
      # Put any authentication code you want in here.
      # This method is run before accessing any resource.
    end
  end
end

map Sinatra::Application.assets_prefix do
  run Sinatra::Application.sprockets
end

run Sinatra::Application
