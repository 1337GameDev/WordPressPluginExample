<?php
namespace TestPlugin\DataClasses {
    use TestPlugin\UtilityFunctions;
    use TestPlugin\YouTubeSearchResult;

    /**
     * Class YouTubeHelper
     * A class to help with YouTube related functions
     *
     * @package TestPlugin\DataClasses
     */
    class YouTubeHelper {
        private $ytconfig = NULL;

        public function __construct(array $ytConfig) {

        }

        public function verifyConfig() : bool {
            return is_array($this->ytconfig)
                && array_key_exists("key", $this->ytconfig);
        }

        /**
         * List videos from a YouTube channel given an ID
         *
         * @param string $channelIDListStr The channel ID to get videos for
         *
         * @return array The channel video information from the GoogleAPI endpoint
         */
        public function getChannelVideosInfo($channelIDListStr){
            //get uploads id
            $url = 'https://www.googleapis.com/youtube/v3/channels?id='.$channelIDListStr.'&key='.$this->ytconfig['key'].'&part=contentDetails';
            $response = json_decode(UtilityFunctions::curl_get($url) );
            if(is_null($response) || property_exists($response,"error") ) {
                return array();
            }

            $uploadIDStr = '';
            for($i=0;$i<count($response->items);$i++) {
                $uploadIDStr .= $response->items[$i]->contentDetails->relatedPlaylists->uploads;
            }

            $maxResultsPerPage = 5;

            //get videos using uploads id
            $url = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId='.$uploadIDStr.'&key='.$this->ytconfig['key'].'&part=snippet&maxResults='.$maxResultsPerPage;
            $response = json_decode(UtilityFunctions::curl_get($url) );
            $videos = $response->items;

            //now test if we fetched all of the videos
            $total = intval($response->pageInfo->totalResults);
            $totalLeft = $total;

            if($totalLeft > $maxResultsPerPage) {//if out total is less than the amount we can display per page, then cycle through pages to get result set
                $nextPageToken = $response->nextPageToken;

                while($totalLeft>$maxResultsPerPage) {
                    $url = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId='.$uploadIDStr.'&key='.$this->ytconfig['key'].'&part=snippet&maxResults='.$maxResultsPerPage.'&pageToken='.$nextPageToken;
                    $subResponse = json_decode(UtilityFunctions::curl_get($url) );
                    $videos = array_merge($videos, $subResponse->items);
                    $totalLeft -= $maxResultsPerPage;
                }
            }

            return $videos;
        }

        /**
         * Get the channel ID from a given YouTube username
         *
         * @param string $username The username to get the channel ID for
         *
         * @return array The resulting list of channel IDs for th given username
         */
        public function getChannelIDsFromUsername($username):array {
            $url = 'https://www.googleapis.com/youtube/v3/channels?key='.$this->ytconfig['key'].'&forUsername='.$username.'&part=id';
            $response = json_decode(UtilityFunctions::curl_get($url) );
            $results = $response->items;
            $ids = [];

            foreach($results as $channel) {
                array_push($ids, $channel);
            }

            return $ids;
        }

        /**
         * Get the YouTube username from a given channel ID
         *
         * @param string $id The channel ID to get the username for
         *
         * @return string The resulting username from a given channel ID
         */
        public function getUsernameFromChannelID($id):string {
            $url = 'https://www.googleapis.com/youtube/v3/search?key='.$this->ytconfig['key'].'&part=snippet&type=channel&channelId='.$id;
            $response = json_decode(UtilityFunctions::curl_get($url) );
            $title = $response->items[0]->snippet->title;

            return $title;
        }

        /**
         * Given a list of video information fetched from the YouTube GoogleAPI, this will create YouTubeSearchResult objects for each video information entry
         *
         * @param array $videoInfo The video information fetched previously
         *
         * @return array The result array of YouTubeSearchResult objects with information to present the videos
         */
        function getSearchResultsFromVideoInfo($videoInfo) {
            $results = array();

            foreach ($videoInfo as $video) {
                $snippet = $video->snippet;
                $id = $video->snippet->resourceId->videoId;
                $title = $snippet->title;
                $description = $snippet->description;
                $channelName = $snippet->channelTitle;
                $preview = '<iframe width="356" height="200" src="https://www.youtube.com/embed/'.$id.'?rel=0" frameborder="0" allowfullscreen></iframe>';
                $url = 'https://www.youtube.com/watch?v='.$id;
                $result = new YouTubeSearchResult('YoutubeVideo', $title,$preview, '', 0, $url, $id, $description);
                $results[] = $result;
            }

            return $results;
        }

        /**
         * Uses WordPress to fetch YouTube videos using custom WordPress posts of type 'youtube_video' and 'youtube_channel' (which will be used to fetch videos for)
         *
         * @return array The result array of YouTubeSearchResult objects with information of the videos fetched / stored
         */
        function getYoutubeVideos() {
            //now fetch the list of youtube channels that have been saved
            $videoArgs = array(
                'numberposts' => -1,
                'post_type' => 'youtube_video'
            );
            $results1 = get_posts($videoArgs);

            $channelArgs = array(
                'numberposts' => -1,
                'post_type' => 'youtube_channel'
            );
            $results2 = get_posts($channelArgs);

            $postResults = array_merge($results1, $results2);
            $channelIdsList = array();
            $channelIds = '';

            foreach ($postResults as $youtubePost) {
                $post_content = json_decode($youtubePost->post_content, true);
                if($youtubePost->post_type == 'youtube_channel') {
                    $channelIdsList[] = $post_content["sourceID"];
                } else {
                    $preview = '<iframe width="356" height="200" src="https://www.youtube.com/embed/'.$post_content["sourceID"].'?rel=0" frameborder="0" allowfullscreen></iframe>';
                    $url = 'https://www.youtube.com/watch?v='.$post_content["sourceID"];
                    $result = new YouTubeSearchResult('YoutubeVideo', $post_content["title"], $preview, '', 0, $url, $post_content["sourceID"], $post_content["description"]);
                    $results[] = $result;
                }
            }
            $channelIdsList = implode(",",$channelIdsList);

            return YouTubeHelper::getSearchResultsFromVideoInfo(YouTubeHelper::getChannelVideosInfo($channelIdsList));
        }

        function __destruct() {

        }
    }
}