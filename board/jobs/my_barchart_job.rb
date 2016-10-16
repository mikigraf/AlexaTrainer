source = 'http://some.remote.host/barchart.xml'

labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

SCHEDULER.every '10s', :first_in => 0 do |job|

  data = [
    {
      data: [6,7,1,4,8,5,$pushUps],
      backgroundColor: [ 'rgba(255, 99, 132, 0.2)' ] * labels.length,
      borderColor: [ 'rgba(255, 99, 132, 1)' ] * labels.length,
      borderWidth: 1,
    }
  ]

  send_event('barchart', { labels: labels, datasets: data })
end
