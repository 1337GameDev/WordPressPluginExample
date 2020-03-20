<?php

/**
 * Class YouTubeSearchResult
 *
 * A class that is used to represent information about a YouTube video
 */
class YouTubeSearchResult {
	public $result_type_name;
	public $title;
	public $preview_html;
	public $keywords_related;
	public $relevance_number;
	public $link_to_result;
	public $attachmentMetaData;
	public $html;

    public function __construct($type, $title, $prev, $keywords_related, $rel, $link, $attachmentMetaData, $html) {
		$this->result_type_name = $type;
		$this->title = $title;
		$this->preview_html = $prev;
		$this->keywords_related = array();
		if($keywords_related != '') {
			$this->keywords_related[] = $keywords_related;
		}

		$this->relevance_number = $rel;
		$this->link_to_result = $link;
		$this->attachmentMetaData = $attachmentMetaData;
		$this->html = $html;
	}

	public static function sortResults($list) {
		if(count($list) == 0) {
			return $list;
		}

		function cmpResult($a, $b){
			if($b->relevance_number == $a->relevance_number) {
				if($b->title == $a->title) {
					return 0;
				} else if($b->title < $a->title) {
					return 1;
				} else {
					return -1;
				}
			} else if($b->relevance_number < $a->relevance_number) {
				return -1;
			} else {
				return 1;
			}
		}

		usort($list,"cmpResult");
		return $list;
	}

	/* --- Below methods are used to help parse the YouTube HTML via a PHP DOMDocument, to get description and other information not directly fetched via the YouTube Google API--- */

	/**
	 * Is used to get the text from this "node" in a linked list of YouTube videos
	 *
	 * @param $Node
	 * @param string $Text
	 * @return string
	 */
	public static function getTextFromNode($Node, $Text = "") {
		if($Node->nodeType === XML_TEXT_NODE){
			return $Text . $Node->textContent;
		}

	    $Node = $Node->firstChild;
	    if ($Node != null) {
			$Text = YouTubeSearchResult::getTextFromNode($Node, $Text);
		}

	    while(is_object($Node) && $Node->nextSibling != null) {
	        $Text = YouTubeSearchResult::getTextFromNode($Node->nextSibling, $Text);
	        $Node = $Node->nextSibling;
	    }
	    return $Text;
	}

	/**
	 * The text from a DOMDocument of a YouTube video
	 *
	 * @param DOMDocument $DOMDoc
	 * @return string
	 */
	public static function getTextFromDocument(\DOMDocument $DOMDoc) {
	  return YouTubeSearchResult::getTextFromNode($DOMDoc->getElementsByTagName('body')->item(0));
	}

	/**
	 * Get the text of a DOMDocument string as if rendering in a browser
	 *
	 * @param $str
	 * @return string
	 */
	public static function getTextOnlyFromDocumentString($str) {
		$dom = new \DOMDocument;
		$dom->preserveWhiteSpace = false;
		$text = '';
		set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
		    if (0 === error_reporting() ) {
		    	return false;
		    }

		    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
		});

		try {
			$dom->loadHTML($str);
			$text = YouTubeSearchResult::getTextFromDocument($dom);
		} catch (ErrorException $e) {}

		restore_error_handler();
		return $text;
	}

	/**
	 * Gets the description from the complete HTML of a YouTube video
	 *
	 * @return string The description
	 */
	public function getTextDescription() {
		$completeHtml = '<?xml encoding="UTF-8"><!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title></title></head><body>';
		$completeHtml .= $this->html;
		$completeHtml .= '</body></html>';

		$str = YouTubeSearchResult::getTextOnlyFromDocumentString($completeHtml);
		$end = '';
		$descriptionLength = 350;
		if(strlen($str) > $descriptionLength) {
			$end = ".....";
		}

		return substr($str, 0, $descriptionLength).$end;
	}
}
?>
