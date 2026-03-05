
export default function InfoPage() {
  return (
    <div>
      <div className="bg-brand-navy text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">League Info</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Everything you need to know about Seattle Wiffleball
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* About the League */}
          <div className="bg-surface-card rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">About the League</h2>
            <div className="space-y-4 text-content-primary leading-relaxed">
              <p>
                Seattle Wiffleball is the premier competitive wiffleball league in the Pacific
                Northwest. Founded in 2015, the league brings together players of all skill levels
                for a summer season of fast-paced, competitive wiffleball at Cowen Park in Seattle.
              </p>
              <p>
                The league emphasizes both competition and community. With teams drafting rosters,
                a full regular season schedule, and a playoff bracket culminating in the World Series,
                Seattle Wiffleball delivers a complete league experience. Games feature radar-gunned
                pitching, official scorekeeping, and detailed statistics tracking.
              </p>
              <p>
                What started as a small group of friends has grown into a thriving league with
                multiple teams competing each season. Whether you&apos;re a seasoned veteran or
                picking up a wiffle bat for the first time, there&apos;s a place for you in
                Seattle Wiffleball.
              </p>
            </div>
          </div>

          {/* Field Location */}
          <div className="bg-surface-card rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Field Location</h2>
            <p className="text-content-primary mb-4">
              All games are played at Cowen Park in the University District neighborhood of Seattle.
              The field features permanent foul poles, a regulation strike zone, and full field setup
              for competitive play.
            </p>
            <div className="rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.5!2d-122.3159!3d47.6679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490148e6be7ba01%3A0x28f1cfca6da89c16!2sCowen%20Park!5e0!3m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cowen Park - Seattle Wiffleball field location"
              />
            </div>
          </div>

          {/* Season Info */}
          <div className="bg-surface-card rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Season Info</h2>
            <div className="text-content-primary leading-relaxed space-y-4">
              <p>
                The Seattle Wiffleball season typically runs from <strong>May through August</strong>,
                with spring training and preseason activities beginning in April. The regular season
                features a round-robin schedule of doubleheaders, with all games played on weekends
                at Cowen Park.
              </p>
              <p>
                The postseason begins in late August, with six teams qualifying for the playoffs.
                The top two seeds receive first-round byes, and all playoff series are best-of-three.
                The season culminates in the World Series, usually held in September.
              </p>
            </div>
          </div>

          {/* How to Join */}
          <div className="bg-surface-card rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">How to Join</h2>
            <p className="text-content-primary mb-6 leading-relaxed">
              Interested in playing? New players are welcome each season. Reach out to get connected
              with a team captain or join the league as a free agent. Prior wiffleball experience is
              not required — just bring a competitive spirit and a willingness to learn.
            </p>
            {/* Replace href with actual signup URL */}
            <a
              href="https://forms.gle/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-navy/90 transition-colors"
            >
              Sign Up to Play
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
