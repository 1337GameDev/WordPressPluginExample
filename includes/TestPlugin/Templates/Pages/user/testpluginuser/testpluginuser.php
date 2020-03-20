<?php /* Template Name: Test Plugin Page */ ?>
<?php get_header(); ?>
<div> Test Plugin Page Content </div>
<?php echo $this->render("user-page-content", ["initialPageCache" => ["Languages" => $model["Languages"]] ], 'testpluginuser');?>
<?php get_footer(); ?>
